const { St, Clutter } = imports.gi;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;

let leftMenu, bottomMenu, rightMenu, topMenu;

function createEdgeMenu(position, contentCallback) {
    let menu = new St.BoxLayout({
        style_class: 'edge-menu',
        vertical: position === 'left' || position === 'right',
    });

    if (contentCallback) {
        contentCallback(menu); // Füge spezifischen Inhalt hinzu
    }

    Main.layoutManager.addChrome(menu);

    // Positioniere das Menü
    switch (position) {
        case 'left':
            menu.set_position(0, 0);
            menu.set_size(200, global.display.get_monitor_geometry(0).height);
            break;
        case 'bottom':
            menu.set_position(0, global.display.get_monitor_geometry(0).height - 100);
            menu.set_size(global.display.get_monitor_geometry(0).width, 100);
            break;
        case 'right':
            menu.set_position(global.display.get_monitor_geometry(0).width - 200, 0);
            menu.set_size(200, global.display.get_monitor_geometry(0).height);
            break;
        case 'top':
            menu.set_position(0, 0);
            menu.set_size(global.display.get_monitor_geometry(0).width, 100);
            break;
    }

    return menu;
}

function init() {
    leftMenu = createEdgeMenu('left', (menu) => {
        // Linkes Menü: Liste aller installierten Apps
        let appList = new St.BoxLayout({ vertical: true });
        let apps = Shell.AppSystem.get_default().get_installed();
        apps.forEach((app) => {
            let button = new St.Button({
                label: app.get_name(),
                style_class: 'app-button'
            });
            button.connect('clicked', () => {
                app.activate();
            });
            appList.add_child(button);
        });
        menu.add_child(appList);
    });

    bottomMenu = createEdgeMenu('bottom', (menu) => {
        // Unteres Menü: Vorschau aller offenen Apps
        let windows = global.get_window_actors();
        windows.forEach((win) => {
            let button = new St.Button({
                label: win.get_meta_window().get_title(),
                style_class: 'window-button'
            });
            button.connect('clicked', () => {
                win.get_meta_window().activate(global.get_current_time());
            });
            menu.add_child(button);
        });
    });

    rightMenu = createEdgeMenu('right', (menu) => {
        // Rechtes Menü: Virtuelle Arbeitsbereiche
        let workspaceManager = global.workspace_manager;
        for (let i = 0; i < workspaceManager.n_workspaces; i++) {
            let button = new St.Button({
                label: `Workspace ${i + 1}`,
                style_class: 'workspace-button'
            });
            button.connect('clicked', () => {
                workspaceManager.get_workspace_by_index(i).activate(global.get_current_time());
            });
            menu.add_child(button);
        }

        // Button zum Hinzufügen eines neuen Arbeitsbereichs
        let addWorkspaceButton = new St.Button({
            label: "Add Workspace",
            style_class: 'add-workspace-button'
        });
        addWorkspaceButton.connect('clicked', () => {
            workspaceManager.append_new_workspace(false, global.get_current_time());
        });
        menu.add_child(addWorkspaceButton);
    });

    topMenu = createEdgeMenu('top', (menu) => {
        // Oberes Menü: Einstellungen und Systemsteuerung
        let shutdownButton = new St.Button({
            label: "Shut Down",
            style_class: 'power-button'
        });
        shutdownButton.connect('clicked', () => {
            Main.overview.hide();
            imports.misc.util.spawn(['gnome-session-quit', '--power-off']);
        });

        let restartButton = new St.Button({
            label: "Restart",
            style_class: 'power-button'
        });
        restartButton.connect('clicked', () => {
            Main.overview.hide();
            imports.misc.util.spawn(['gnome-session-quit', '--reboot']);
        });

        menu.add_child(shutdownButton);
        menu.add_child(restartButton);
    });
}

function destroy() {
    if (leftMenu) leftMenu.destroy();
    if (bottomMenu) bottomMenu.destroy();
    if (rightMenu) rightMenu.destroy();
    if (topMenu) topMenu.destroy();
}