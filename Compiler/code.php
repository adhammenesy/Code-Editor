<?php
require '../Keys.php';

$code_decoded = base64_decode(base64_encode($GEMENI_API_KEY));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Editor</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/default.min.css">
</head>
<body class="bg-gray-900">
    <div class="flex h-screen">
        <div class="w-64 bg-gray-800 text-white" oncontextmenu="UIManager.showContextMenu(event)">
            <div class="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 class="text-xl font-bold">Explorer</h2>
                <div class="flex space-x-2">
                    <button class="p-2 hover:bg-gray-700 rounded" onclick="UIManager.handleNewFolder()">
                        <i class="fas fa-folder-plus"></i>
                    </button>
                    <button class="p-2 hover:bg-gray-700 rounded" onclick="UIManager.handleNewFile()">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div id="fileTree" class="p-2 space-y-1">
                <div class="file-explorer"></div>
            </div>
        </div>
        <div class="flex-1 flex flex-col" id="container">
            <div class="bg-gray-800 text-white p-2 flex">
                <div id="tabs" class="flex space-x-1">
                    <button class="p-2 hover:bg-gray-700 rounded" onclick="gptChat('<?php echo $code_decoded ?>')">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            </div>
            <div id="editor" style="background-color: #242424" class="w-full flex-1 h-full"></div>
        </div>
    </div>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/languages/go.min.js"></script>
    <script src="../Public/Javascript/code.js"></script>
    <script src="../Public/Javascript/encryptData.js"></script>
    <script src="../Public/Javascript/FileSystemManager.js"></script>
    <script src="../Public/Javascript/gpt.js"></script>
    <script src="../Public/Javascript/highlight.js"></script>
    <script src="../Public/Javascript/storage.js"></script>
    <script>hljs.highlightAll()</script>
</body>
</html>