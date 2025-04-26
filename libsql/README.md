# libSQL API for JavaScript/TypeScript

```console
LIBSQL_JS_DEV=1 npm run build
```

On Android

```console
# TODO: Edit `package.json` to add `android` to the `os` array. 
npx tsc
npm pack

cargo build --release
cp target/release/liblibsql_js.s index.node

```

After that, if you drop the index.node file into a separate package (see `../libsql-android-arm64`), libsql will pick it up when it is run on that platform.

Unfortunately, this appears to be the best way to support libsql on android. It's fairly straightforward, so it shouldn't be too hard, but I don't know how cross-compatible the builds are.


## License

This project is licensed under the [MIT license].

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in libSQL by you, shall be licensed as MIT, without any additional
terms or conditions.

[MIT license]: https://github.com/libsql/libsql-node/blob/main/LICENSE
