// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate cocoa;
extern crate objc;

use log::{info, warn};

use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::io::{Read, Write};
use std::ops::ControlFlow;
use std::path::Path;
use std::process::Command;
use std::str;
use std::thread;
use std::time::{Duration, Instant};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn get_active_application_name() -> String {
    let output = Command::new("osascript")
        .arg("-e")
        .arg("tell application \"System Events\" to get the unix id of every process whose frontmost is true")
        .output()
        .expect("Failed to execute osascript");
    let stdout = str::from_utf8(&output.stdout).expect("Could not convert to string");
    let pid: i32 = stdout.trim().parse().expect("Failed to parse PID");
    let ps_output = Command::new("ps")
        .arg("-p")
        .arg(pid.to_string())
        .arg("-o")
        .arg("command=")
        .output()
        .expect("Failed to execute ps");
    let ps_stdout = str::from_utf8(&ps_output.stdout)
        .expect("Could not convert to string")
        .trim()
        .to_string();

    // Extract the base directory path
    let base_dir = Path::new(&ps_stdout)
        .parent()
        .and_then(Path::parent)
        .and_then(|p| p.to_str())
        .unwrap_or(&ps_stdout)
        .to_string();

    base_dir
}

fn block_unauthorized_launch(app_path: String) {
    // Load the whitelist
    let whitelist = Whitelist::load();
    let authorized_apps = &whitelist.apps;

    // Normalize the detected app's path to its base directory
    let base_dir_detected = Path::new(&app_path)
        .parent()
        .and_then(|p| p.to_str())
        .unwrap_or(&app_path)
        .to_string();

    // Check if the app is whitelisted
    if authorized_apps.contains(&base_dir_detected) {
        info!("{} is authorized. Allowing...", base_dir_detected);
        return;
    }

    info!("Unauthorized launch of {} detected. Blocking...", app_path);

    // Get the process ID of the unauthorized application
    let output = Command::new("pgrep")
        .arg("-f")
        .arg(&app_path)
        .output()
        .expect("Failed to execute pgrep");

    let pid_str = str::from_utf8(&output.stdout)
        .expect("Failed to convert to string")
        .trim();
    let pids: Vec<&str> = pid_str.split('\n').collect();

    info!("PIDs to kill: {:?}", pids); // Debugging line

    if pids.is_empty() || pids[0].is_empty() {
        warn!("No matching PID found.");
        return;
    }

    // Terminate the unauthorized applications
    for pid in pids {
        if !pid.is_empty() {
            let kill_output = Command::new("kill")
                .arg("-9")
                .arg(pid)
                .output()
                .expect("Failed to execute kill");
            info!("Kill command output for PID {}: {:?}", pid, kill_output);
        }
    }
}

fn monitor(
    start_time: Instant,
    focus_duration: Duration,
    app_names: &Vec<String>,
) -> ControlFlow<()> {
    let app_name = get_active_application_name();
    let elapsed_time = Instant::now().duration_since(start_time);
    if elapsed_time >= focus_duration {
        info!("Focus session ended. You can now use any application.");
        return ControlFlow::Break(());
    }
    if !app_names.contains(&app_name) {
        info!("Unauthorized launch of {} detected. Blocking...", app_name);
        block_unauthorized_launch(app_name);
    }
    thread::sleep(Duration::from_secs(1));
    ControlFlow::Continue(())
}

#[derive(Debug, Serialize, Deserialize)]
struct AppInfo {
    app_name: String,
    app_path: String,
}

#[tauri::command]
fn search_apps(term: &str) -> Vec<AppInfo> {
    let _term = term.to_lowercase();
    info!("Searching for apps containing: {}", _term);
    let mut found_apps = Vec::new();
    // Path to the Applications directory
    let path = Path::new("/Applications");
    // Iterate through each entry in the Applications directory
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(file_name) = entry.file_name().into_string() {
                // Check if the application name contains the search term
                if file_name.to_lowercase().contains(&_term) {
                    let app_info = AppInfo {
                        app_name: file_name.clone(),
                        app_path: entry.path().to_str().unwrap().to_string(),
                    };
                    found_apps.push(app_info);
                }
            }
        }
    }
    found_apps
}


#[derive(Serialize, Deserialize)]
struct Whitelist {
    apps: Vec<String>,
}

impl Whitelist {
    fn load() -> Self {
        let path = Path::new("./whitelist.json");
        info!("load: Loading whitelist from {:?}", path);
        if path.exists() {
            let mut file = File::open(path).expect("Failed to open file");
            let mut data = String::new();
            file.read_to_string(&mut data).expect("Failed to read file");
            serde_json::from_str(&data).expect("Failed to parse JSON")
        } else {
            Whitelist { apps: Vec::new() }
        }
    }

    fn save(&self) {
        info!("save: Saving whitelist");
        let data = serde_json::to_string(self).expect("Failed to serialize");
        let mut file = File::create("whitelist.json").expect("Failed to create file");
        file.write_all(data.as_bytes())
            .expect("Failed to write file");
    }

    fn add_app(&mut self, app_path: String) {
        info!("Adding {} to whitelist", app_path);
        self.apps.push(app_path);
        self.save();
    }
}

#[tauri::command]
fn add_to_whitelist(app_path: String) {
    info!("add_to_whitelist {} to whitelist", app_path);
    let mut whitelist = Whitelist::load();
    whitelist.add_app(app_path);
}

#[tauri::command]
fn get_whitelist() -> Vec<String> {
    info!("get_whitelist: Getting whitelist");
    let whitelist = Whitelist::load();
    info!("get_whitelist: {:?}", whitelist.apps);
    whitelist.apps
}

fn main() {
    env_logger::init();
    let mut whitelist = Whitelist::load(); // Load the whitelist from the JSON file
    let app_paths = whitelist.apps.clone(); // Clone the app names to pass to the thread
    info!("main - Whitelist: {:?}", app_paths); // Debugging line
                                                // Spawn a new thread to run your focus session loop
    thread::spawn(move || {
        let focus_duration = Duration::from_secs(1 * 60);
        let start_time = Instant::now();
        let mut is_montitoring = false;
        while is_montitoring {
            is_montitoring = match monitor(start_time, focus_duration, &app_paths) {
                ControlFlow::Continue(_) => true,
                ControlFlow::Break(_) => false,
            };
        }
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            search_apps,
            greet,
            add_to_whitelist,
            get_whitelist
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
