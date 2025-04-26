# On Android, 


### Better-SQLite3

the only thing required is to define this environment variable when installing the package

```console
GYP_DEFINES="android_ndk_path=''" npm install
```

### Libsql

- Clone the libsql-js repo.
- Edit `package.json` to add `android` to the `os` array. 
- Build and pack the libsql package
- Extract the built package into the parent directory and name it `libsql`
- Build the native binary with `cargo build --release`
- `cp target/release/liblibsql_js.do libsql-android-arm64/index.node`
- `cp package-android-arm64.json libsql-android-arm64/package.json`
- Add the following to project package.json
```js
{
  "dependencies":{
    "@libsql/android-arm64": "file:libsql-android-arm64",
    "libsql": "file:libsql"
  },
  "overrides": {
    "@libsql/client": {
      "libsql": "file:libsql"
    },
    "libsql": {
      "@libsql/android-arm64": "file:libsql-android-arm64"
    }
  },
}
```
- We might need to install the actual directories themselves as I don't think the overrides activate for deeper dependancies. I'm not sure.