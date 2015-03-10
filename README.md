# gulp-browser-js-include
This plugin recursively expand files it includes, so you can nest includes inside of files that were themselves included.

## Usage

### Install
```bash
npm install --save-dev gulp-browser-js-include
```


### Sample `gulpfile.js`
Then, add it to your `gulpfile.js`:

```javascript
var gulp = require('gulp'),
	includeJs = require('gulp-browser-js-include');

gulp.task('js', function() {
	gulp.src('src/js/main.js')
		.pipe(includeJs())
		.pipe(gulp.dest('./dest/js'));
});

gulp.task('watch', function() {
	gulp.watch(['src/**/*.js'], ['js']);
});

gulp.task('default', ['watch']);
```

#### Example

`main.js`
```javascript
//= include bar.js comment remove
//= include foo.js

var c = bar(1, 2);
var d = foo(4, 4);

console.log(c === 3);
console.log(d === 4);
```

`bar.js`
```javascript
function bar(a, b) {
    return a + b;
}

```

`foo.js`
```html
//= include tor.js

function foo(a, b) {
    return tor(a * b);
}
```

`tor.js`
```javascript
function tor(a) {
    return Math.sqrt(a);
}
```

Results
```javascript
function bar(a, b) {
    return a + b;
}

function tor(a) {
    return Math.sqrt(a);
}

function foo(a, b) {
    return tor(a * b);
}

var c = bar(1, 2);
var d = foo(4, 4);

console.log(c === 3);
console.log(d === 4);
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)