
exports.successes = [
    "foo",
    42,
    "aaa/bbb",
    "/path/to/a.txt",
    "path/to/abc/"
];

exports.invalids = [
    "",
    null,
    true,
    [ "foo" ],
    { foo: "bar" },

    ".",
    "..",
    "foo/bar/../../../",
    "../foo/bar",
    "/../../foo/bar/baz"
];