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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Navbar\": function() { return /* binding */ Navbar; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _styles_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/colors */ \"./src/styles/colors.ts\");\n/* harmony import */ var _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useWindowSize */ \"./src/hooks/useWindowSize.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nconst Navbar = (param)=>{\n    let {} = param;\n    _s();\n    const { height , width  } = (0,_hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    const isMobileView = width < 600;\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const fontSize = isMobileView ? \"20px\" : \"20px\";\n    const handleNavigation = (route)=>{\n        router.push(route);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n        width: \"100%\",\n        direction: \"column\",\n        // backdropFilter=\"blur(10px)\" // Apply blur for glass effect\n        position: \"fixed\",\n        pb: \"20px\",\n        top: 0,\n        left: 0,\n        right: 0,\n        zIndex: 1000,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            direction: \"row\",\n            w: \"100%\",\n            px: \"14px\",\n            pt: \"12px\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                        color: _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite,\n                        fontSize: \"15px\",\n                        mb: \"-10px\",\n                        children: \"Rift\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                        lineNumber: 31,\n                        columnNumber: 11\n                    }, undefined)\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 30,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Spacer, {}, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 35,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                        color: _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite,\n                        fontFamily: \"Nostromo Regular\",\n                        fontWeight: \"bold\",\n                        fontSize: \"15px\",\n                        letterSpacing: \"-15%\",\n                        mb: \"-10px\",\n                        children: \"Connect Wallet\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                        lineNumber: 37,\n                        columnNumber: 11\n                    }, undefined)\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 36,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 29,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n        lineNumber: 18,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Navbar, \"fZdPB98un70ArTWOYD0mUxCgoBw=\", false, function() {\n    return [\n        _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter\n    ];\n});\n_c = Navbar;\nvar _c;\n$RefreshReg$(_c, \"Navbar\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9OYXZiYXIudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQThFO0FBQ3hDO0FBQ2E7QUFDWDtBQUdqQyxNQUFNTSxTQUFTLFNBQVE7UUFBUCxFQUFFOztJQUN2QixNQUFNLEVBQUVDLE9BQU0sRUFBRUMsTUFBSyxFQUFFLEdBQUdKLGdFQUFhQTtJQUN2QyxNQUFNSyxlQUFlRCxRQUFRO0lBQzdCLE1BQU1FLFNBQVNMLHNEQUFTQTtJQUN4QixNQUFNTSxXQUFXRixlQUFlLFNBQVMsTUFBTTtJQUUvQyxNQUFNRyxtQkFBbUIsQ0FBQ0MsUUFBa0I7UUFDMUNILE9BQU9JLElBQUksQ0FBQ0Q7SUFDZDtJQUVBLHFCQUNFLDhEQUFDYixrREFBSUE7UUFDSFEsT0FBTTtRQUNOTyxXQUFXO1FBQ1gsNkRBQTZEO1FBQzdEQyxVQUFTO1FBQ1RDLElBQUc7UUFDSEMsS0FBSztRQUNMQyxNQUFNO1FBQ05DLE9BQU87UUFDUEMsUUFBUTtrQkFFUiw0RUFBQ3JCLGtEQUFJQTtZQUFDZSxXQUFVO1lBQU1PLEdBQUU7WUFBT0MsSUFBSTtZQUFRQyxJQUFHOzs4QkFDNUMsOERBQUN4QixrREFBSUE7OEJBQ0gsNEVBQUNFLGtEQUFJQTt3QkFBQ3VCLE9BQU90QiwrREFBZTt3QkFBRVEsVUFBVTt3QkFBUWdCLElBQUc7a0NBQVE7Ozs7Ozs7Ozs7OzhCQUk3RCw4REFBQzFCLG9EQUFNQTs7Ozs7OEJBQ1AsOERBQUNELGtEQUFJQTs4QkFDSCw0RUFBQ0Usa0RBQUlBO3dCQUNIdUIsT0FBT3RCLCtEQUFlO3dCQUN0QnlCLFlBQVk7d0JBQ1pDLFlBQVk7d0JBQ1psQixVQUFVO3dCQUNWbUIsZUFBZTt3QkFDZkgsSUFBRztrQ0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9YLEVBQUU7R0E1Q1dyQjs7UUFDZUYsNERBQWFBO1FBRXhCQyxrREFBU0E7OztLQUhiQyIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvY29tcG9uZW50cy9OYXZiYXIudHN4PzlhNmQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQm94LCBCdXR0b24sIEZsZXgsIEZsZXhQcm9wcywgU3BhY2VyLCBUZXh0IH0gZnJvbSBcIkBjaGFrcmEtdWkvcmVhY3RcIjtcbmltcG9ydCBjb2xvcnMgZnJvbSBcIi4uL3N0eWxlcy9jb2xvcnNcIjtcbmltcG9ydCB1c2VXaW5kb3dTaXplIGZyb20gXCIuLi9ob29rcy91c2VXaW5kb3dTaXplXCI7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tIFwibmV4dC9yb3V0ZXJcIjtcbmltcG9ydCB7IElvTWVudSB9IGZyb20gXCJyZWFjdC1pY29ucy9pbzVcIjtcblxuZXhwb3J0IGNvbnN0IE5hdmJhciA9ICh7fSkgPT4ge1xuICBjb25zdCB7IGhlaWdodCwgd2lkdGggfSA9IHVzZVdpbmRvd1NpemUoKTtcbiAgY29uc3QgaXNNb2JpbGVWaWV3ID0gd2lkdGggPCA2MDA7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuICBjb25zdCBmb250U2l6ZSA9IGlzTW9iaWxlVmlldyA/IFwiMjBweFwiIDogXCIyMHB4XCI7XG5cbiAgY29uc3QgaGFuZGxlTmF2aWdhdGlvbiA9IChyb3V0ZTogc3RyaW5nKSA9PiB7XG4gICAgcm91dGVyLnB1c2gocm91dGUpO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEZsZXhcbiAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICBkaXJlY3Rpb249e1wiY29sdW1uXCJ9XG4gICAgICAvLyBiYWNrZHJvcEZpbHRlcj1cImJsdXIoMTBweClcIiAvLyBBcHBseSBibHVyIGZvciBnbGFzcyBlZmZlY3RcbiAgICAgIHBvc2l0aW9uPVwiZml4ZWRcIlxuICAgICAgcGI9XCIyMHB4XCJcbiAgICAgIHRvcD17MH1cbiAgICAgIGxlZnQ9ezB9XG4gICAgICByaWdodD17MH1cbiAgICAgIHpJbmRleD17MTAwMH0gLy8gRW5zdXJlIGl0J3MgYWJvdmUgb3RoZXIgY29udGVudFxuICAgID5cbiAgICAgIDxGbGV4IGRpcmVjdGlvbj1cInJvd1wiIHc9XCIxMDAlXCIgcHg9e1wiMTRweFwifSBwdD1cIjEycHhcIj5cbiAgICAgICAgPEZsZXg+XG4gICAgICAgICAgPFRleHQgY29sb3I9e2NvbG9ycy5vZmZXaGl0ZX0gZm9udFNpemU9e1wiMTVweFwifSBtYj1cIi0xMHB4XCI+XG4gICAgICAgICAgICBSaWZ0XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0ZsZXg+XG4gICAgICAgIDxTcGFjZXIgLz5cbiAgICAgICAgPEZsZXg+XG4gICAgICAgICAgPFRleHRcbiAgICAgICAgICAgIGNvbG9yPXtjb2xvcnMub2ZmV2hpdGV9XG4gICAgICAgICAgICBmb250RmFtaWx5PXtcIk5vc3Ryb21vIFJlZ3VsYXJcIn1cbiAgICAgICAgICAgIGZvbnRXZWlnaHQ9e1wiYm9sZFwifVxuICAgICAgICAgICAgZm9udFNpemU9e1wiMTVweFwifVxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZz17XCItMTUlXCJ9XG4gICAgICAgICAgICBtYj1cIi0xMHB4XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBDb25uZWN0IFdhbGxldFxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9GbGV4PlxuICAgICAgPC9GbGV4PlxuICAgIDwvRmxleD5cbiAgKTtcbn07XG4iXSwibmFtZXMiOlsiRmxleCIsIlNwYWNlciIsIlRleHQiLCJjb2xvcnMiLCJ1c2VXaW5kb3dTaXplIiwidXNlUm91dGVyIiwiTmF2YmFyIiwiaGVpZ2h0Iiwid2lkdGgiLCJpc01vYmlsZVZpZXciLCJyb3V0ZXIiLCJmb250U2l6ZSIsImhhbmRsZU5hdmlnYXRpb24iLCJyb3V0ZSIsInB1c2giLCJkaXJlY3Rpb24iLCJwb3NpdGlvbiIsInBiIiwidG9wIiwibGVmdCIsInJpZ2h0IiwiekluZGV4IiwidyIsInB4IiwicHQiLCJjb2xvciIsIm9mZldoaXRlIiwibWIiLCJmb250RmFtaWx5IiwiZm9udFdlaWdodCIsImxldHRlclNwYWNpbmciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/components/Navbar.tsx\n"));

/***/ })

});