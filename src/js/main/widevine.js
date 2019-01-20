require("./global");
import path from 'path';

export const initWidevine = (app) => {
  let widevineCdmPluginPath = getWidevineCdmPluginPath();
  console.log(`widevine-cdm-path: ${widevineCdmPluginPath}\n`);

  app.commandLine.appendSwitch("widevine-cdm-path", widevineCdmPluginPath);
  app.commandLine.appendSwitch("widevine-cdm-version", "1.4.8.970");
};

const getWidevineCdmPluginPath = () => {
  let basePath = path.resolve(__dirname, "./node_modules/electron-widevinecdm/widevine");

  if (global.PLATFORM_DARWIN) {
    return path.join(basePath, "/darwin_x64/_platform_specific/mac_x64/widevinecdmadapter.plugin");
  } else if (global.PLATFORM_WIN32 && global.ARCH_64) {
    return path.join(basePath, "\\win32_x64\\_platform_specific\\win_x64\\widevinecdmadapter.dll");
  } else if (global.PLATFORM_WIN32 && global.ARCH_32) {
    return path.join(basePath, "\\win32_ia32\\_platform_specific\\win_x86\\widevinecdmadapter.dll");
  } else if (global.PLATFORM_LINUX) {
    return path.join(basePath, "/linux_x64/libwidevinecdmadapter.so");
  }
};
