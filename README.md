# Python Notebook Local Agent

<div style="display:flex; flex-direction:row;gap:100px; margin-bottom:20px; width:100%;">
  <img src="https://tauri.app/_astro/logo_light.Br3nqH4L.svg" height=50 style="margin-bottom:10px">
  <img src="https://jupyter.org/assets/logos/rectanglelogo-greytext-orangebody-greymoons.svg" height=50>
</div>

A [Tauri](https://tauri.app) based desktop application which allows a user to run Python notebook on their local machine in the background with user's already available python setup.

## Features:
- Choose either **One-off** or **Scheduled** mode
  - **One-Off**: Run a notebook in the background job
  - **Scheduled**: Run a notebook in the background job using a schedule specified by cron string
- View and cancel **Scheduled** notebook jobs
- View pervious runs in the **Completed** tab

## Setup

Follow the below steps to get started:

<ol>
    <li>Install a Jupyter python environment. Anaconda or Miniconda is recommended</li>
    <li>Install <code>papermill</code> and <code>nbconvert</code> package through <code>pip install</code></li>
    <li>Install any additional packages that might be used by your own notebook</li>
    <li>Launch the `pynb-worker` application</li>
    <li>Configure the <b>Python Executable</b></li>
    <li>Set the <b>Data Directory</b></li>
    <li>Click <b>Save</b></li>
    <li>Click on <b>Run</b> tab to begin executing your notebook </li>
</ol>

## Screenshots

### Landing Page

![landing](./screenshots/landing.png)

### One-Off Run

![one off](./screenshots/one_off.png)

### Scheduled 

![scheduled one](./screenshots/scheduled_1.png)
![scheduled two](./screenshots/scheduled_2.png)

### Completed

![report 1](./screenshots/report_1.png)
![report 2](./screenshots/report_2.png)


## Feature Wishlist

- Custom labels for both run types
- Allow YAML based execution parameters for notebook
- Allow setting environment variable for notebook directly through the UI

## Known Limitation and Issues

- Only tested on Windows Platform
- All scheduled jobs become inactive on exit and not restarted when application restart

## License

Custom License. By using the software you agree to the following:

1) Software is strictly intended for personal use.
2) Software should only be used on on a personal machine and for non commercial activity.
3) User assumes all risk(s) and liability associated with use of software.
4) Any use beyond simple personal evaluation will require permission of the author
5) Author(s) are not responsible for any issues that arise from usage of this software.
6) The software is free to evaluate currently but that might change in the future
7) License agreement and terms may change in the future. Additional terms that eliminate liability or dictate use maybe be added.