﻿//#/////////////////#//
//# CORDOVA PLUGINS #//
//#/////////////////#//
cordova.define('cordova/plugin_list', function (require, exports, module) {
	module.exports = [{
			"file" : "plugins/cordova-plugin-dialogs/www/notification.js",
			"id" : "cordova-plugin-dialogs.notification",
			"merges" : [
				"navigator.notification"
			]
		}, {
			"file" : "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
			"id" : "cordova-plugin-inappbrowser.inappbrowser",
			"clobbers" : [
				"cordova.InAppBrowser.open",
				"window.open"
			]
		}
	];
	/////////////////////
	// TOP OF METADATA //
	/////////////////////
	module.exports.metadata = {
		"cordova-plugin-dialogs"      : "1.1.1",
		"cordova-plugin-inappbrowser" : "1.0.1"
	};
	////////////////////
	// BB10 EXCEPTION //
	////////////////////
	if (/BB10|playbook/i.test(navigator.userAgent)) {
		module.exports          = [
			module.exports[0]];
		module.exports.metadata = { 
			"cordova-plugin-dialogs" : "1.1.1" 
		};
	}
	////////////////
	// MSAPP FILE //
	////////////////
	if (/MSApp/i.test(navigator.userAgent)) {
		module.exports = [{
				"file" : "plugins/cordova-plugin-file/www/DirectoryEntry.js",
				"id" : "cordova-plugin-file.DirectoryEntry",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.DirectoryEntry"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/DirectoryReader.js",
				"id" : "cordova-plugin-file.DirectoryReader",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.DirectoryReader"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/Entry.js",
				"id" : "cordova-plugin-file.Entry",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.Entry"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/File.js",
				"id" : "cordova-plugin-file.File",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.File"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileEntry.js",
				"id" : "cordova-plugin-file.FileEntry",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileEntry"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileError.js",
				"id" : "cordova-plugin-file.FileError",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileError"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileReader.js",
				"id" : "cordova-plugin-file.FileReader",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileReader"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileSystem.js",
				"id" : "cordova-plugin-file.FileSystem",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileSystem"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileUploadOptions.js",
				"id" : "cordova-plugin-file.FileUploadOptions",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileUploadOptions"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileUploadResult.js",
				"id" : "cordova-plugin-file.FileUploadResult",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileUploadResult"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/FileWriter.js",
				"id" : "cordova-plugin-file.FileWriter",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.FileWriter"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/Flags.js",
				"id" : "cordova-plugin-file.Flags",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.Flags"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/LocalFileSystem.js",
				"id" : "cordova-plugin-file.LocalFileSystem",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.LocalFileSystem"
				],
				"merges" : [
					"window"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/Metadata.js",
				"id" : "cordova-plugin-file.Metadata",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.Metadata"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/ProgressEvent.js",
				"id" : "cordova-plugin-file.ProgressEvent",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.ProgressEvent"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/fileSystems.js",
				"id" : "cordova-plugin-file.fileSystems",
				"pluginId" : "cordova-plugin-file"
			}, {
				"file" : "plugins/cordova-plugin-file/www/requestFileSystem.js",
				"id" : "cordova-plugin-file.requestFileSystem",
				"pluginId" : "cordova-plugin-file",
				"clobbers" : [
					"window.requestFileSystem"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js",
				"id" : "cordova-plugin-file.resolveLocalFileSystemURI",
				"pluginId" : "cordova-plugin-file",
				"merges" : [
					"window"
				]
			}, {
				"file" : "plugins/cordova-plugin-file/src/windows/FileProxy.js",
				"id" : "cordova-plugin-file.FileProxy",
				"pluginId" : "cordova-plugin-file",
				"merges" : [
					""
				]
			}, {
				"file" : "plugins/cordova-plugin-file/www/fileSystemPaths.js",
				"id" : "cordova-plugin-file.fileSystemPaths",
				"pluginId" : "cordova-plugin-file",
				"merges" : [
					"cordova"
				],
				"runs" : true
			}
		];
		/////////////////////
		// TOP OF METADATA //
		/////////////////////
		module.exports.metadata = {
			"cordova-plugin-file" : "4.0.1-dev"
		}
	}
//////
}); //
//////

