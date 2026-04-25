"use strict";
const DecoderMemoryLimitInMegabytesDefault = 32;
const ShowDebugOutputDefault = false;

function save_options() {
  var SaveDecoderMemoryLimitInMegabytes = parseInt(
    document.getElementById("DecoderMemoryLimitInMegabytes").value,
    10
  );
  var SaveDebugOutput = document.getElementById("ShowDebugOutput").checked;

  chrome.storage.local.set(
    {
      DecoderMemoryLimitInMegabytes: SaveDecoderMemoryLimitInMegabytes,
      ShowDebugOutput: SaveDebugOutput
    },
    function() {
      var status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function() {
        status.textContent = "";
      }, 1050);

      chrome.runtime.sendMessage({ type: "tiff-options-updated" });
    }
  );
}

function restore_options() {
  chrome.storage.local.get(
    ["DecoderMemoryLimitInMegabytes", "ShowDebugOutput"],
    function(options) {
      if (options.DecoderMemoryLimitInMegabytes !== undefined) {
        document.getElementById("DecoderMemoryLimitInMegabytes").value =
          options.DecoderMemoryLimitInMegabytes;
      } else {
        document.getElementById("DecoderMemoryLimitInMegabytes").value =
          DecoderMemoryLimitInMegabytesDefault;
      }

      if (options.ShowDebugOutput !== undefined) {
        document.getElementById("ShowDebugOutput").checked =
          options.ShowDebugOutput;
      } else {
        document.getElementById("ShowDebugOutput").checked =
          ShowDebugOutputDefault;
      }
    }
  );
}

function reset_options() {
  document.getElementById("DecoderMemoryLimitInMegabytes").value =
    DecoderMemoryLimitInMegabytesDefault;
  document.getElementById("ShowDebugOutput").checked = ShowDebugOutputDefault;

  var status = document.getElementById("status");
  status.textContent = "Options restored, need to save.";
  setTimeout(function() {
    status.textContent = "";
  }, 1550);
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("reset").addEventListener("click", reset_options);
