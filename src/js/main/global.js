global.ARCH = process.arch;
global.PLATFORM = process.platform;
global.ENV = process.env.NODE_ENV;

global.ARCH_32 = /32/.test(global.ARCH);
global.ARCH_64 = /64/.test(global.ARCH);
global.PLATFORM_WIN32 = /win32/.test(global.PLATFORM);
global.PLATFORM_LINUX = /linux/.test(global.PLATFORM);
global.PLATFORM_DARWIN = /darwin/.test(global.PLATFORM);
global.ENV_DEVELOPMENT = /development/.test(global.ENV);
