import "jest-preset-angular";
import "jest-localstorage-mock";
import "jest-date-mock";

Object.defineProperty(window, "getComputedStyle", {
	value: () => ["-webkit-appearance"]
});