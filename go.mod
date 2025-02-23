module github.com/khulnasoft/ezburn

// Support for Go 1.13 is deliberate so people can build ezburn
// themselves for old OS versions. Please do not change this.
go 1.23.5

// This dependency cannot be upgraded or ezburn would no longer
// compile with Go 1.13. Please do not change this. For more info,
// please read this: https://ezburn.github.io/faq/#old-go-version
require golang.org/x/sys v0.0.0-20220715151400-c0bba94af5f8
