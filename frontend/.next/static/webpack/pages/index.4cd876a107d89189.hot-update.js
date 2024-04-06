"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./src/components/Navbar.tsx":
/*!***********************************!*\
  !*** ./src/components/Navbar.tsx ***!
  \***********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Navbar\": function() { return /* binding */ Navbar; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _styles_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/colors */ \"./src/styles/colors.ts\");\n/* harmony import */ var _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useWindowSize */ \"./src/hooks/useWindowSize.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nconst Navbar = (param)=>{\n    let {} = param;\n    _s();\n    const { height , width  } = (0,_hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    const isMobileView = width < 600;\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const fontSize = isMobileView ? \"20px\" : \"20px\";\n    const handleNavigation = (route)=>{\n        router.push(route);\n    };\n    const navItem = (text, route)=>{\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            _hover: {\n                background: \"rgba(200, 200, 200, 0.1)\"\n            },\n            cursor: \"pointer\",\n            borderRadius: \"6px\",\n            onClick: ()=>handleNavigation(route),\n            px: \"6px\",\n            py: \"4px\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                color: router.pathname == \"/\" ? _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite : _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].gray,\n                fontSize: \"18px\",\n                children: text\n            }, void 0, false, {\n                fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                lineNumber: 27,\n                columnNumber: 9\n            }, undefined)\n        }, void 0, false, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 19,\n            columnNumber: 7\n        }, undefined);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n        width: \"100%\",\n        direction: \"column\",\n        position: \"fixed\",\n        top: 0,\n        left: 0,\n        right: 0,\n        zIndex: 1000,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            direction: \"row\",\n            w: \"100%\",\n            px: \"30px\",\n            pt: \"20px\",\n            children: [\n                navItem(\"Home\", \"/\"),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Spacer, {}, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 49,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                        color: _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite,\n                        fontFamily: \"Nostromo Regular\",\n                        fontWeight: \"bold\",\n                        fontSize: \"15px\",\n                        letterSpacing: \"-15%\",\n                        children: \"Connect Wallet\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                        lineNumber: 51,\n                        columnNumber: 11\n                    }, undefined)\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 50,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 47,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n        lineNumber: 38,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Navbar, \"fZdPB98un70ArTWOYD0mUxCgoBw=\", false, function() {\n    return [\n        _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter\n    ];\n});\n_c = Navbar;\nvar _c;\n$RefreshReg$(_c, \"Navbar\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9OYXZiYXIudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQThFO0FBQ3hDO0FBQ2E7QUFDWDtBQUdqQyxNQUFNTSxTQUFTLFNBQVE7UUFBUCxFQUFFOztJQUN2QixNQUFNLEVBQUVDLE9BQU0sRUFBRUMsTUFBSyxFQUFFLEdBQUdKLGdFQUFhQTtJQUN2QyxNQUFNSyxlQUFlRCxRQUFRO0lBQzdCLE1BQU1FLFNBQVNMLHNEQUFTQTtJQUN4QixNQUFNTSxXQUFXRixlQUFlLFNBQVMsTUFBTTtJQUUvQyxNQUFNRyxtQkFBbUIsQ0FBQ0MsUUFBa0I7UUFDMUNILE9BQU9JLElBQUksQ0FBQ0Q7SUFDZDtJQUVBLE1BQU1FLFVBQVUsQ0FBQ0MsTUFBY0gsUUFBa0I7UUFDL0MscUJBQ0UsOERBQUNiLGtEQUFJQTtZQUNIaUIsUUFBUTtnQkFBRUMsWUFBWTtZQUEyQjtZQUNqREMsUUFBUTtZQUNSQyxjQUFjO1lBQ2RDLFNBQVMsSUFBTVQsaUJBQWlCQztZQUNoQ1MsSUFBRztZQUNIQyxJQUFHO3NCQUVILDRFQUFDckIsa0RBQUlBO2dCQUNIc0IsT0FBT2QsT0FBT2UsUUFBUSxJQUFJLE1BQU10QiwrREFBZSxHQUFHQSwyREFBVztnQkFDN0RRLFVBQVU7MEJBRVRLOzs7Ozs7Ozs7OztJQUlUO0lBRUEscUJBQ0UsOERBQUNoQixrREFBSUE7UUFDSFEsT0FBTTtRQUNOb0IsV0FBVztRQUNYQyxVQUFTO1FBQ1RDLEtBQUs7UUFDTEMsTUFBTTtRQUNOQyxPQUFPO1FBQ1BDLFFBQVE7a0JBRVIsNEVBQUNqQyxrREFBSUE7WUFBQzRCLFdBQVU7WUFBTU0sR0FBRTtZQUFPWixJQUFJO1lBQVFhLElBQUc7O2dCQUMzQ3BCLFFBQVEsUUFBUTs4QkFDakIsOERBQUNkLG9EQUFNQTs7Ozs7OEJBQ1AsOERBQUNELGtEQUFJQTs4QkFDSCw0RUFBQ0Usa0RBQUlBO3dCQUNIc0IsT0FBT3JCLCtEQUFlO3dCQUN0QmlDLFlBQVk7d0JBQ1pDLFlBQVk7d0JBQ1oxQixVQUFVO3dCQUNWMkIsZUFBZTtrQ0FDaEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFPWCxFQUFFO0dBekRXaEM7O1FBQ2VGLDREQUFhQTtRQUV4QkMsa0RBQVNBOzs7S0FIYkMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvTmF2YmFyLnRzeD85YTZkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJveCwgQnV0dG9uLCBGbGV4LCBGbGV4UHJvcHMsIFNwYWNlciwgVGV4dCB9IGZyb20gXCJAY2hha3JhLXVpL3JlYWN0XCI7XG5pbXBvcnQgY29sb3JzIGZyb20gXCIuLi9zdHlsZXMvY29sb3JzXCI7XG5pbXBvcnQgdXNlV2luZG93U2l6ZSBmcm9tIFwiLi4vaG9va3MvdXNlV2luZG93U2l6ZVwiO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSBcIm5leHQvcm91dGVyXCI7XG5pbXBvcnQgeyBJb01lbnUgfSBmcm9tIFwicmVhY3QtaWNvbnMvaW81XCI7XG5cbmV4cG9ydCBjb25zdCBOYXZiYXIgPSAoe30pID0+IHtcbiAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSB1c2VXaW5kb3dTaXplKCk7XG4gIGNvbnN0IGlzTW9iaWxlVmlldyA9IHdpZHRoIDwgNjAwO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgZm9udFNpemUgPSBpc01vYmlsZVZpZXcgPyBcIjIwcHhcIiA6IFwiMjBweFwiO1xuXG4gIGNvbnN0IGhhbmRsZU5hdmlnYXRpb24gPSAocm91dGU6IHN0cmluZykgPT4ge1xuICAgIHJvdXRlci5wdXNoKHJvdXRlKTtcbiAgfTtcblxuICBjb25zdCBuYXZJdGVtID0gKHRleHQ6IHN0cmluZywgcm91dGU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8RmxleFxuICAgICAgICBfaG92ZXI9e3sgYmFja2dyb3VuZDogXCJyZ2JhKDIwMCwgMjAwLCAyMDAsIDAuMSlcIiB9fVxuICAgICAgICBjdXJzb3I9e1wicG9pbnRlclwifVxuICAgICAgICBib3JkZXJSYWRpdXM9e1wiNnB4XCJ9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZU5hdmlnYXRpb24ocm91dGUpfVxuICAgICAgICBweD1cIjZweFwiXG4gICAgICAgIHB5PVwiNHB4XCJcbiAgICAgID5cbiAgICAgICAgPFRleHRcbiAgICAgICAgICBjb2xvcj17cm91dGVyLnBhdGhuYW1lID09IFwiL1wiID8gY29sb3JzLm9mZldoaXRlIDogY29sb3JzLmdyYXl9XG4gICAgICAgICAgZm9udFNpemU9e1wiMThweFwifVxuICAgICAgICA+XG4gICAgICAgICAge3RleHR9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvRmxleD5cbiAgICApO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEZsZXhcbiAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICBkaXJlY3Rpb249e1wiY29sdW1uXCJ9XG4gICAgICBwb3NpdGlvbj1cImZpeGVkXCJcbiAgICAgIHRvcD17MH1cbiAgICAgIGxlZnQ9ezB9XG4gICAgICByaWdodD17MH1cbiAgICAgIHpJbmRleD17MTAwMH1cbiAgICA+XG4gICAgICA8RmxleCBkaXJlY3Rpb249XCJyb3dcIiB3PVwiMTAwJVwiIHB4PXtcIjMwcHhcIn0gcHQ9XCIyMHB4XCI+XG4gICAgICAgIHtuYXZJdGVtKFwiSG9tZVwiLCBcIi9cIil9XG4gICAgICAgIDxTcGFjZXIgLz5cbiAgICAgICAgPEZsZXg+XG4gICAgICAgICAgPFRleHRcbiAgICAgICAgICAgIGNvbG9yPXtjb2xvcnMub2ZmV2hpdGV9XG4gICAgICAgICAgICBmb250RmFtaWx5PXtcIk5vc3Ryb21vIFJlZ3VsYXJcIn1cbiAgICAgICAgICAgIGZvbnRXZWlnaHQ9e1wiYm9sZFwifVxuICAgICAgICAgICAgZm9udFNpemU9e1wiMTVweFwifVxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZz17XCItMTUlXCJ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQ29ubmVjdCBXYWxsZXRcbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvRmxleD5cbiAgICAgIDwvRmxleD5cbiAgICA8L0ZsZXg+XG4gICk7XG59O1xuIl0sIm5hbWVzIjpbIkZsZXgiLCJTcGFjZXIiLCJUZXh0IiwiY29sb3JzIiwidXNlV2luZG93U2l6ZSIsInVzZVJvdXRlciIsIk5hdmJhciIsImhlaWdodCIsIndpZHRoIiwiaXNNb2JpbGVWaWV3Iiwicm91dGVyIiwiZm9udFNpemUiLCJoYW5kbGVOYXZpZ2F0aW9uIiwicm91dGUiLCJwdXNoIiwibmF2SXRlbSIsInRleHQiLCJfaG92ZXIiLCJiYWNrZ3JvdW5kIiwiY3Vyc29yIiwiYm9yZGVyUmFkaXVzIiwib25DbGljayIsInB4IiwicHkiLCJjb2xvciIsInBhdGhuYW1lIiwib2ZmV2hpdGUiLCJncmF5IiwiZGlyZWN0aW9uIiwicG9zaXRpb24iLCJ0b3AiLCJsZWZ0IiwicmlnaHQiLCJ6SW5kZXgiLCJ3IiwicHQiLCJmb250RmFtaWx5IiwiZm9udFdlaWdodCIsImxldHRlclNwYWNpbmciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/components/Navbar.tsx\n"));

/***/ })

});