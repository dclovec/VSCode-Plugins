
let vscode,
    APICLOUD,
    config,
    isStarted;

function activate(context) {
    console.log('Congratulations, your extension "apicloud-plugin" is now active!');
    vscode = require('vscode');
    APICLOUD = require('apicloud-tools-core');
    config = require('./config.json');

    function getRandomPort() {
        return ~~(1000 + 8000 * Math.random())
    }

    const commands = [];
    //启动wifi服务
    function startWifi() {
        if (!isStarted) {
            try {
                APICLOUD.startWifi({ port: (config.wifi.port || (config.wifi.port = getRandomPort())) });
                isStarted = true;

                APICLOUD.wifiLog(function (log) {
                    console.log(log.content);
                }).then(function () {
                    console.log('apicloud wifi日志服务已启动。')
                }).catch(function () { });

                showWifiInfo(null, '启动成功：');
            } catch (err) {
                vscode.window.showErrorMessage('启动wifi服务发生错误，请重试：' + (err || '未知错误'), { modal: true });
            }
        } else {
            showWifiInfo(null, 'wifi服务已启动：');
        }
    }
    commands.push(vscode.commands.registerCommand('extension.startWifi', startWifi));
    //停止wifi服务
    commands.push(vscode.commands.registerCommand('extension.stopWifi', function () {
        if (!!isStarted) {
            try {
                APICLOUD.endWifi({});
                isStarted = false;
                vscode.window.showInformationMessage('已关闭。');
            } catch (err) {
                vscode.window.showErrorMessage('关闭wifi服务发生错误：' + (err || '未知错误'), { modal: true });
            }
        } else {
            vscode.window.showInformationMessage('wifi服务未启动。', { modal: true });
        }
    }));
    //查看wifi服务信息
    function showWifiInfo(_, prevMsg) {
        if (!!isStarted) {
            try {
                const info = APICLOUD.wifiInfo();
                vscode.window.showInformationMessage((prevMsg || 'wifi服务信息：') + 'IP：' + info.ip.join(',') + '|端口：' + info.port);
            } catch (err) {
                vscode.window.showErrorMessage((prevMsg || '') + '获取wifi服务信息发生错误：' + (err || '未知错误'), { modal: true });
            }
        } else {
            vscode.window.showInformationMessage('wifi服务未启动。', { modal: true });
        }
    }
    commands.push(vscode.commands.registerCommand('extension.showWifiInfo', showWifiInfo));
    //wifi增量同步代码
    commands.push(vscode.commands.registerCommand('extension.addSyncByWifi', function () {
        if (!!isStarted) {
            try {
                APICLOUD.syncWifi({ syncAll: false, projectPath: vscode.workspace.rootPath });
                vscode.window.showInformationMessage('增量同步成功！');
            } catch (err) {
                vscode.window.showErrorMessage('增量同步失败：' + (err || '未知错误'), { modal: true });
            }
        } else {
            vscode.window.showInformationMessage('wifi服务未启动。', { modal: true });
        }
    }));
    //wifi全量同步代码
    commands.push(vscode.commands.registerCommand('extension.allSyncByWifi', function () {
        if (!!isStarted) {
            try {
                APICLOUD.syncWifi({ syncAll: true, projectPath: vscode.workspace.rootPath });
                vscode.window.showInformationMessage('全量同步成功！');
            } catch (err) {
                vscode.window.showErrorMessage('全量同步失败：' + (err || '未知错误'), { modal: true });
            }
        } else {
            vscode.window.showInformationMessage('wifi服务未启动。', { modal: true });
        }
    }));
    //修改wifi服务端口
    commands.push(vscode.commands.registerCommand('extension.modifyWifiPort', function () {
        // let closeState = false;
        // try {
        //     if (!!isStarted) {
        //         vscode.window.showInformationMessage('关闭wifi服务中...');
        //         APICLOUD.endWifi({});
        //         vscode.window.showInformationMessage('已关闭wifi服务');
        //     }
        //     closeState = true;
        // } catch (err) {
        //     vscode.window.showErrorMessage('修改失败：' + (err || '未知错误'), { modal: true });
        // }
        // if (closeState) {
        //     vscode.window.showInputBox({
        //         ignoreFocusOut: true,
        //         placeHolder: '输入端口号（范围：1000~9000）',
        //         value: config.wifi.port
        //     }).then(function (port) {
        //         console.log(port)
        //         if (!!port) {
        //             if (!(/\d+/.test(port))) {
        //                 vscode.window.showErrorMessage('输入的端口含有非法字符（必须是1000~9000的数字）！');
        //             } else if (1000 > port || 9000 < port) {
        //                 vscode.window.showErrorMessage('输入的端口超出范围（1000~9000）！');
        //             } else {
        //                 config.wifi.port = +port;
        //                 require('fs').writeFile('./config.json', JSON.stringify(config.wifi.port), function (err) {
        //                     (vscode.window[!err ? 'showInformationMessage' : 'showErrorMessage'])(err || '修改成功！');
        //                     if (!!isStarted) {
        //                         isStarted = false;
        //                         startWifi();
        //                     }
        //                 });
        //             }
        //         }
        //     });
        // }
    }));
    context.subscriptions.push.apply(context.subscriptions, commands);
}
exports.activate = activate;


function deactivate() {
    !!isStarted && (APICLOUD.endWifi({}), isStarted = false);
    vscode = APICLOUD = config = null;
}
exports.deactivate = deactivate;