"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/_app",{

/***/ "./src/theme.tsx":
/*!***********************!*\
  !*** ./src/theme.tsx ***!
  \***********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _styles_colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/colors */ \"./src/styles/colors.ts\");\n\n\nconst fonts = {\n    mono: \"'Menlo', monospace\"\n};\nconst theme = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_1__.extendTheme)({\n    styles: {\n        global: {\n            \"html, body\": {\n                backgroundColor: \"#020202\",\n                fontFamily: \"Nostromo Regular\",\n                fontWeight: \"bold\",\n                letterSpacing: \"-15%\",\n                color: _styles_colors__WEBPACK_IMPORTED_MODULE_0__[\"default\"].offWhite\n            },\n            text: {\n                fontFamily: \"Nostromo Regular\",\n                fontWeight: \"bold\",\n                letterSpacing: \"-15%\",\n                color: _styles_colors__WEBPACK_IMPORTED_MODULE_0__[\"default\"].offWhite\n            }\n        }\n    },\n    fonts,\n    components: {\n        Box: {\n            variants: {\n                project: {\n                    \"&:hover\": {\n                        \".overlay\": {\n                            opacity: 0.5\n                        },\n                        \".text\": {\n                            opacity: 1\n                        }\n                    }\n                }\n            }\n        }\n    }\n});\n/* harmony default export */ __webpack_exports__[\"default\"] = (theme);\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdGhlbWUudHN4LmpzIiwibWFwcGluZ3MiOiI7OztBQUErQztBQUNWO0FBRXJDLE1BQU1FLFFBQVE7SUFBRUMsTUFBTztBQUFvQjtBQUUzQyxNQUFNQyxRQUFRSiw2REFBV0EsQ0FBQztJQUN4QkssUUFBUTtRQUNOQyxRQUFRO1lBQ04sY0FBYztnQkFDWkMsaUJBQWlCO2dCQUNqQkMsWUFBWTtnQkFDWkMsWUFBWTtnQkFDWkMsZUFBZTtnQkFDZkMsT0FBT1YsK0RBQWU7WUFDeEI7WUFDQVksTUFBTTtnQkFDSkwsWUFBWTtnQkFDWkMsWUFBWTtnQkFDWkMsZUFBZTtnQkFDZkMsT0FBT1YsK0RBQWU7WUFDeEI7UUFDRjtJQUNGO0lBQ0FDO0lBQ0FZLFlBQVk7UUFDVkMsS0FBSztZQUNIQyxVQUFVO2dCQUNSQyxTQUFTO29CQUNQLFdBQVc7d0JBQ1QsWUFBWTs0QkFDVkMsU0FBUzt3QkFDWDt3QkFDQSxTQUFTOzRCQUNQQSxTQUFTO3dCQUNYO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0Y7QUFFQSwrREFBZWQsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvdGhlbWUudHN4PzdjOWYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXh0ZW5kVGhlbWUgfSBmcm9tIFwiQGNoYWtyYS11aS9yZWFjdFwiO1xuaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi9zdHlsZXMvY29sb3JzXCI7XG5cbmNvbnN0IGZvbnRzID0geyBtb25vOiBgJ01lbmxvJywgbW9ub3NwYWNlYCB9O1xuXG5jb25zdCB0aGVtZSA9IGV4dGVuZFRoZW1lKHtcbiAgc3R5bGVzOiB7XG4gICAgZ2xvYmFsOiB7XG4gICAgICBcImh0bWwsIGJvZHlcIjoge1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzAyMDIwMlwiLFxuICAgICAgICBmb250RmFtaWx5OiBcIk5vc3Ryb21vIFJlZ3VsYXJcIixcbiAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgIGxldHRlclNwYWNpbmc6IFwiLTE1JVwiLFxuICAgICAgICBjb2xvcjogY29sb3JzLm9mZldoaXRlLFxuICAgICAgfSxcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgZm9udEZhbWlseTogXCJOb3N0cm9tbyBSZWd1bGFyXCIsXG4gICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICBsZXR0ZXJTcGFjaW5nOiBcIi0xNSVcIixcbiAgICAgICAgY29sb3I6IGNvbG9ycy5vZmZXaGl0ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgZm9udHMsXG4gIGNvbXBvbmVudHM6IHtcbiAgICBCb3g6IHtcbiAgICAgIHZhcmlhbnRzOiB7XG4gICAgICAgIHByb2plY3Q6IHtcbiAgICAgICAgICBcIiY6aG92ZXJcIjoge1xuICAgICAgICAgICAgXCIub3ZlcmxheVwiOiB7XG4gICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIi50ZXh0XCI6IHtcbiAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCB0aGVtZTtcbiJdLCJuYW1lcyI6WyJleHRlbmRUaGVtZSIsImNvbG9ycyIsImZvbnRzIiwibW9ubyIsInRoZW1lIiwic3R5bGVzIiwiZ2xvYmFsIiwiYmFja2dyb3VuZENvbG9yIiwiZm9udEZhbWlseSIsImZvbnRXZWlnaHQiLCJsZXR0ZXJTcGFjaW5nIiwiY29sb3IiLCJvZmZXaGl0ZSIsInRleHQiLCJjb21wb25lbnRzIiwiQm94IiwidmFyaWFudHMiLCJwcm9qZWN0Iiwib3BhY2l0eSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/theme.tsx\n"));

/***/ })

});