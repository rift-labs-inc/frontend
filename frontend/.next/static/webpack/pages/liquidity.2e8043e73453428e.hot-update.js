"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/liquidity",{

/***/ "./src/components/Navbar.tsx":
/*!***********************************!*\
  !*** ./src/components/Navbar.tsx ***!
  \***********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Navbar\": function() { return /* binding */ Navbar; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _styles_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/colors */ \"./src/styles/colors.ts\");\n/* harmony import */ var _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useWindowSize */ \"./src/hooks/useWindowSize.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nconst Navbar = (param)=>{\n    let {} = param;\n    _s();\n    const { height , width  } = (0,_hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    const isMobileView = width < 600;\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const fontSize = isMobileView ? \"20px\" : \"20px\";\n    const handleNavigation = (route)=>{\n        router.push(route);\n    };\n    const navItem = (text, route)=>{\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            _hover: {\n                background: \"rgba(200, 200, 200, 0.1)\"\n            },\n            cursor: \"pointer\",\n            borderRadius: \"6px\",\n            mr: \"15px\",\n            onClick: ()=>handleNavigation(route),\n            px: \"10px\",\n            py: \"2px\",\n            position: \"relative\" // Ensure the Flex container is relative\n            ,\n            alignItems: \"center\" // Align items vertically at the center\n            ,\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    color: router.pathname == route ? _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite : _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].textGray,\n                    fontSize: \"18px\",\n                    children: text\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 30,\n                    columnNumber: 9\n                }, undefined),\n                router.pathname === route && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n                    position: \"absolute\",\n                    w: \"100px\",\n                    bottom: \"0\" // Adjust based on your design needs\n                    ,\n                    left: \"0\",\n                    right: \"0\",\n                    height: \"2px\" // Thickness of the underline\n                    ,\n                    bgGradient: \"linear(to-r, \".concat(_styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].RiftBlue, \", \").concat(_styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].RiftOrange, \")\")\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 37,\n                    columnNumber: 11\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 19,\n            columnNumber: 7\n        }, undefined);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n        width: \"100%\",\n        direction: \"column\",\n        position: \"fixed\",\n        top: 0,\n        left: 0,\n        right: 0,\n        zIndex: 1000,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            direction: \"row\",\n            w: \"100%\",\n            px: \"30px\",\n            pt: \"25px\",\n            children: [\n                navItem(\"Home\", \"/\"),\n                navItem(\"Activity\", \"/activity\"),\n                navItem(\"Liquidity\", \"/liquidity\"),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Spacer, {}, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 65,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {}, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 66,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 61,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n        lineNumber: 52,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Navbar, \"fZdPB98un70ArTWOYD0mUxCgoBw=\", false, function() {\n    return [\n        _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter\n    ];\n});\n_c = Navbar;\nvar _c;\n$RefreshReg$(_c, \"Navbar\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9OYXZiYXIudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQThFO0FBQ3hDO0FBQ2E7QUFDWDtBQUdqQyxNQUFNTSxTQUFTLFNBQVE7UUFBUCxFQUFFOztJQUN2QixNQUFNLEVBQUVDLE9BQU0sRUFBRUMsTUFBSyxFQUFFLEdBQUdKLGdFQUFhQTtJQUN2QyxNQUFNSyxlQUFlRCxRQUFRO0lBQzdCLE1BQU1FLFNBQVNMLHNEQUFTQTtJQUN4QixNQUFNTSxXQUFXRixlQUFlLFNBQVMsTUFBTTtJQUUvQyxNQUFNRyxtQkFBbUIsQ0FBQ0MsUUFBa0I7UUFDMUNILE9BQU9JLElBQUksQ0FBQ0Q7SUFDZDtJQUVBLE1BQU1FLFVBQVUsQ0FBQ0MsTUFBY0gsUUFBa0I7UUFDL0MscUJBQ0UsOERBQUNiLGtEQUFJQTtZQUNIaUIsUUFBUTtnQkFBRUMsWUFBWTtZQUEyQjtZQUNqREMsUUFBTztZQUNQQyxjQUFhO1lBQ2JDLElBQUc7WUFDSEMsU0FBUyxJQUFNVixpQkFBaUJDO1lBQ2hDVSxJQUFHO1lBQ0hDLElBQUc7WUFDSEMsVUFBUyxXQUFXLHdDQUF3Qzs7WUFDNURDLFlBQVcsU0FBUyx1Q0FBdUM7Ozs4QkFFM0QsOERBQUN4QixrREFBSUE7b0JBQ0h5QixPQUFPakIsT0FBT2tCLFFBQVEsSUFBSWYsUUFBUVYsK0RBQWUsR0FBR0EsK0RBQWU7b0JBQ25FUSxVQUFTOzhCQUVSSzs7Ozs7O2dCQUVGTixPQUFPa0IsUUFBUSxLQUFLZix1QkFDbkIsOERBQUNiLGtEQUFJQTtvQkFDSHlCLFVBQVM7b0JBQ1RNLEdBQUc7b0JBQ0hDLFFBQU8sSUFBSSxvQ0FBb0M7O29CQUMvQ0MsTUFBSztvQkFDTEMsT0FBTTtvQkFDTjNCLFFBQU8sTUFBTSw2QkFBNkI7O29CQUMxQzRCLFlBQVksZ0JBQW9DaEMsT0FBcEJBLCtEQUFlLEVBQUMsTUFBc0IsT0FBbEJBLGlFQUFpQixFQUFDOzs7Ozs7Ozs7Ozs7SUFLNUU7SUFFQSxxQkFDRSw4REFBQ0gsa0RBQUlBO1FBQ0hRLE9BQU07UUFDTjhCLFdBQVc7UUFDWGIsVUFBUztRQUNUYyxLQUFLO1FBQ0xOLE1BQU07UUFDTkMsT0FBTztRQUNQTSxRQUFRO2tCQUVSLDRFQUFDeEMsa0RBQUlBO1lBQUNzQyxXQUFVO1lBQU1QLEdBQUU7WUFBT1IsSUFBSTtZQUFRa0IsSUFBRzs7Z0JBQzNDMUIsUUFBUSxRQUFRO2dCQUNoQkEsUUFBUSxZQUFZO2dCQUNwQkEsUUFBUSxhQUFhOzhCQUN0Qiw4REFBQ2Qsb0RBQU1BOzs7Ozs4QkFDUCw4REFBQ0Qsa0RBQUlBOzs7Ozs7Ozs7Ozs7Ozs7O0FBSWIsRUFBRTtHQS9EV007O1FBQ2VGLDREQUFhQTtRQUV4QkMsa0RBQVNBOzs7S0FIYkMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvTmF2YmFyLnRzeD85YTZkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJveCwgQnV0dG9uLCBGbGV4LCBGbGV4UHJvcHMsIFNwYWNlciwgVGV4dCB9IGZyb20gXCJAY2hha3JhLXVpL3JlYWN0XCI7XG5pbXBvcnQgY29sb3JzIGZyb20gXCIuLi9zdHlsZXMvY29sb3JzXCI7XG5pbXBvcnQgdXNlV2luZG93U2l6ZSBmcm9tIFwiLi4vaG9va3MvdXNlV2luZG93U2l6ZVwiO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSBcIm5leHQvcm91dGVyXCI7XG5pbXBvcnQgeyBJb01lbnUgfSBmcm9tIFwicmVhY3QtaWNvbnMvaW81XCI7XG5cbmV4cG9ydCBjb25zdCBOYXZiYXIgPSAoe30pID0+IHtcbiAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSB1c2VXaW5kb3dTaXplKCk7XG4gIGNvbnN0IGlzTW9iaWxlVmlldyA9IHdpZHRoIDwgNjAwO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgZm9udFNpemUgPSBpc01vYmlsZVZpZXcgPyBcIjIwcHhcIiA6IFwiMjBweFwiO1xuXG4gIGNvbnN0IGhhbmRsZU5hdmlnYXRpb24gPSAocm91dGU6IHN0cmluZykgPT4ge1xuICAgIHJvdXRlci5wdXNoKHJvdXRlKTtcbiAgfTtcblxuICBjb25zdCBuYXZJdGVtID0gKHRleHQ6IHN0cmluZywgcm91dGU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8RmxleFxuICAgICAgICBfaG92ZXI9e3sgYmFja2dyb3VuZDogXCJyZ2JhKDIwMCwgMjAwLCAyMDAsIDAuMSlcIiB9fVxuICAgICAgICBjdXJzb3I9XCJwb2ludGVyXCJcbiAgICAgICAgYm9yZGVyUmFkaXVzPVwiNnB4XCJcbiAgICAgICAgbXI9XCIxNXB4XCJcbiAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlTmF2aWdhdGlvbihyb3V0ZSl9XG4gICAgICAgIHB4PVwiMTBweFwiXG4gICAgICAgIHB5PVwiMnB4XCJcbiAgICAgICAgcG9zaXRpb249XCJyZWxhdGl2ZVwiIC8vIEVuc3VyZSB0aGUgRmxleCBjb250YWluZXIgaXMgcmVsYXRpdmVcbiAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiIC8vIEFsaWduIGl0ZW1zIHZlcnRpY2FsbHkgYXQgdGhlIGNlbnRlclxuICAgICAgPlxuICAgICAgICA8VGV4dFxuICAgICAgICAgIGNvbG9yPXtyb3V0ZXIucGF0aG5hbWUgPT0gcm91dGUgPyBjb2xvcnMub2ZmV2hpdGUgOiBjb2xvcnMudGV4dEdyYXl9XG4gICAgICAgICAgZm9udFNpemU9XCIxOHB4XCJcbiAgICAgICAgPlxuICAgICAgICAgIHt0ZXh0fVxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIHtyb3V0ZXIucGF0aG5hbWUgPT09IHJvdXRlICYmIChcbiAgICAgICAgICA8RmxleFxuICAgICAgICAgICAgcG9zaXRpb249XCJhYnNvbHV0ZVwiXG4gICAgICAgICAgICB3PXtcIjEwMHB4XCJ9XG4gICAgICAgICAgICBib3R0b209XCIwXCIgLy8gQWRqdXN0IGJhc2VkIG9uIHlvdXIgZGVzaWduIG5lZWRzXG4gICAgICAgICAgICBsZWZ0PVwiMFwiXG4gICAgICAgICAgICByaWdodD1cIjBcIlxuICAgICAgICAgICAgaGVpZ2h0PVwiMnB4XCIgLy8gVGhpY2tuZXNzIG9mIHRoZSB1bmRlcmxpbmVcbiAgICAgICAgICAgIGJnR3JhZGllbnQ9e2BsaW5lYXIodG8tciwgJHtjb2xvcnMuUmlmdEJsdWV9LCAke2NvbG9ycy5SaWZ0T3JhbmdlfSlgfVxuICAgICAgICAgID48L0ZsZXg+XG4gICAgICAgICl9XG4gICAgICA8L0ZsZXg+XG4gICAgKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxGbGV4XG4gICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgZGlyZWN0aW9uPXtcImNvbHVtblwifVxuICAgICAgcG9zaXRpb249XCJmaXhlZFwiXG4gICAgICB0b3A9ezB9XG4gICAgICBsZWZ0PXswfVxuICAgICAgcmlnaHQ9ezB9XG4gICAgICB6SW5kZXg9ezEwMDB9XG4gICAgPlxuICAgICAgPEZsZXggZGlyZWN0aW9uPVwicm93XCIgdz1cIjEwMCVcIiBweD17XCIzMHB4XCJ9IHB0PVwiMjVweFwiPlxuICAgICAgICB7bmF2SXRlbShcIkhvbWVcIiwgXCIvXCIpfVxuICAgICAgICB7bmF2SXRlbShcIkFjdGl2aXR5XCIsIFwiL2FjdGl2aXR5XCIpfVxuICAgICAgICB7bmF2SXRlbShcIkxpcXVpZGl0eVwiLCBcIi9saXF1aWRpdHlcIil9XG4gICAgICAgIDxTcGFjZXIgLz5cbiAgICAgICAgPEZsZXg+ey8qIENPTk5FQ1QgV0FMTEVUIEJVVFRPTiAqL308L0ZsZXg+XG4gICAgICA8L0ZsZXg+XG4gICAgPC9GbGV4PlxuICApO1xufTtcbiJdLCJuYW1lcyI6WyJGbGV4IiwiU3BhY2VyIiwiVGV4dCIsImNvbG9ycyIsInVzZVdpbmRvd1NpemUiLCJ1c2VSb3V0ZXIiLCJOYXZiYXIiLCJoZWlnaHQiLCJ3aWR0aCIsImlzTW9iaWxlVmlldyIsInJvdXRlciIsImZvbnRTaXplIiwiaGFuZGxlTmF2aWdhdGlvbiIsInJvdXRlIiwicHVzaCIsIm5hdkl0ZW0iLCJ0ZXh0IiwiX2hvdmVyIiwiYmFja2dyb3VuZCIsImN1cnNvciIsImJvcmRlclJhZGl1cyIsIm1yIiwib25DbGljayIsInB4IiwicHkiLCJwb3NpdGlvbiIsImFsaWduSXRlbXMiLCJjb2xvciIsInBhdGhuYW1lIiwib2ZmV2hpdGUiLCJ0ZXh0R3JheSIsInciLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJiZ0dyYWRpZW50IiwiUmlmdEJsdWUiLCJSaWZ0T3JhbmdlIiwiZGlyZWN0aW9uIiwidG9wIiwiekluZGV4IiwicHQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/components/Navbar.tsx\n"));

/***/ })

});