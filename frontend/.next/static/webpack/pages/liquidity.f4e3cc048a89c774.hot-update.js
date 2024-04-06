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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Navbar\": function() { return /* binding */ Navbar; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _styles_colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/colors */ \"./src/styles/colors.ts\");\n/* harmony import */ var _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useWindowSize */ \"./src/hooks/useWindowSize.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n\nvar _s = $RefreshSig$();\n\n\n\n\nconst Navbar = (param)=>{\n    let {} = param;\n    _s();\n    const { height , width  } = (0,_hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    const isMobileView = width < 600;\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const fontSize = isMobileView ? \"20px\" : \"20px\";\n    const handleNavigation = (route)=>{\n        router.push(route);\n    };\n    const navItem = (text, route)=>{\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            _hover: {\n                background: \"rgba(200, 200, 200, 0.1)\"\n            },\n            cursor: \"pointer\",\n            borderRadius: \"6px\",\n            mr: \"15px\",\n            onClick: ()=>handleNavigation(route),\n            px: \"10px\",\n            py: \"2px\",\n            position: \"relative\" // Ensure the Flex container is relative\n            ,\n            alignItems: \"center\" // Align items vertically at the center\n            ,\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    color: router.pathname == route ? _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].offWhite : _styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].textGray,\n                    fontSize: \"18px\",\n                    children: text\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 30,\n                    columnNumber: 9\n                }, undefined),\n                router.pathname === route && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n                    position: \"absolute\",\n                    top: \"28px\",\n                    w: router.pathname === \"/liquidity\" ? \"100px\" : router.pathname === \"/activity\" ? \"94px\" : \"59px\",\n                    height: \"2px\" // Thickness of the underline\n                    ,\n                    bgGradient: \"linear(to-r, \".concat(_styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].gradient1, \", \").concat(_styles_colors__WEBPACK_IMPORTED_MODULE_1__[\"default\"].gradient2, \")\")\n                }, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 37,\n                    columnNumber: 11\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 19,\n            columnNumber: 7\n        }, undefined);\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n        width: \"100%\",\n        direction: \"column\",\n        position: \"fixed\",\n        top: 0,\n        left: 0,\n        right: 0,\n        zIndex: 1000,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {\n            direction: \"row\",\n            w: \"100%\",\n            px: \"30px\",\n            pt: \"25px\",\n            children: [\n                navItem(\"Home\", \"/\"),\n                navItem(\"Activity\", \"/activity\"),\n                navItem(\"Liquidity\", \"/liquidity\"),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Spacer, {}, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 69,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Flex, {}, void 0, false, {\n                    fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n                    lineNumber: 70,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n            lineNumber: 65,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/Navbar.tsx\",\n        lineNumber: 56,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Navbar, \"fZdPB98un70ArTWOYD0mUxCgoBw=\", false, function() {\n    return [\n        _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter\n    ];\n});\n_c = Navbar;\nvar _c;\n$RefreshReg$(_c, \"Navbar\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9OYXZiYXIudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQThFO0FBQ3hDO0FBQ2E7QUFDWDtBQUdqQyxNQUFNTSxTQUFTLFNBQVE7UUFBUCxFQUFFOztJQUN2QixNQUFNLEVBQUVDLE9BQU0sRUFBRUMsTUFBSyxFQUFFLEdBQUdKLGdFQUFhQTtJQUN2QyxNQUFNSyxlQUFlRCxRQUFRO0lBQzdCLE1BQU1FLFNBQVNMLHNEQUFTQTtJQUN4QixNQUFNTSxXQUFXRixlQUFlLFNBQVMsTUFBTTtJQUUvQyxNQUFNRyxtQkFBbUIsQ0FBQ0MsUUFBa0I7UUFDMUNILE9BQU9JLElBQUksQ0FBQ0Q7SUFDZDtJQUVBLE1BQU1FLFVBQVUsQ0FBQ0MsTUFBY0gsUUFBa0I7UUFDL0MscUJBQ0UsOERBQUNiLGtEQUFJQTtZQUNIaUIsUUFBUTtnQkFBRUMsWUFBWTtZQUEyQjtZQUNqREMsUUFBTztZQUNQQyxjQUFhO1lBQ2JDLElBQUc7WUFDSEMsU0FBUyxJQUFNVixpQkFBaUJDO1lBQ2hDVSxJQUFHO1lBQ0hDLElBQUc7WUFDSEMsVUFBUyxXQUFXLHdDQUF3Qzs7WUFDNURDLFlBQVcsU0FBUyx1Q0FBdUM7Ozs4QkFFM0QsOERBQUN4QixrREFBSUE7b0JBQ0h5QixPQUFPakIsT0FBT2tCLFFBQVEsSUFBSWYsUUFBUVYsK0RBQWUsR0FBR0EsK0RBQWU7b0JBQ25FUSxVQUFTOzhCQUVSSzs7Ozs7O2dCQUVGTixPQUFPa0IsUUFBUSxLQUFLZix1QkFDbkIsOERBQUNiLGtEQUFJQTtvQkFDSHlCLFVBQVU7b0JBQ1ZNLEtBQUk7b0JBQ0pDLEdBQ0V0QixPQUFPa0IsUUFBUSxLQUFLLGVBQ2hCLFVBQ0FsQixPQUFPa0IsUUFBUSxLQUFLLGNBQ3BCLFNBQ0EsTUFBTTtvQkFFWnJCLFFBQU8sTUFBTSw2QkFBNkI7O29CQUMxQzBCLFlBQVksZ0JBQXFDOUIsT0FBckJBLGdFQUFnQixFQUFDLE1BQXFCLE9BQWpCQSxnRUFBZ0IsRUFBQzs7Ozs7Ozs7Ozs7O0lBSzVFO0lBRUEscUJBQ0UsOERBQUNILGtEQUFJQTtRQUNIUSxPQUFNO1FBQ040QixXQUFXO1FBQ1hYLFVBQVM7UUFDVE0sS0FBSztRQUNMTSxNQUFNO1FBQ05DLE9BQU87UUFDUEMsUUFBUTtrQkFFUiw0RUFBQ3ZDLGtEQUFJQTtZQUFDb0MsV0FBVTtZQUFNSixHQUFFO1lBQU9ULElBQUk7WUFBUWlCLElBQUc7O2dCQUMzQ3pCLFFBQVEsUUFBUTtnQkFDaEJBLFFBQVEsWUFBWTtnQkFDcEJBLFFBQVEsYUFBYTs4QkFDdEIsOERBQUNkLG9EQUFNQTs7Ozs7OEJBQ1AsOERBQUNELGtEQUFJQTs7Ozs7Ozs7Ozs7Ozs7OztBQUliLEVBQUU7R0FuRVdNOztRQUNlRiw0REFBYUE7UUFFeEJDLGtEQUFTQTs7O0tBSGJDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy9jb21wb25lbnRzL05hdmJhci50c3g/OWE2ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb3gsIEJ1dHRvbiwgRmxleCwgRmxleFByb3BzLCBTcGFjZXIsIFRleHQgfSBmcm9tIFwiQGNoYWtyYS11aS9yZWFjdFwiO1xuaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vc3R5bGVzL2NvbG9yc1wiO1xuaW1wb3J0IHVzZVdpbmRvd1NpemUgZnJvbSBcIi4uL2hvb2tzL3VzZVdpbmRvd1NpemVcIjtcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gXCJuZXh0L3JvdXRlclwiO1xuaW1wb3J0IHsgSW9NZW51IH0gZnJvbSBcInJlYWN0LWljb25zL2lvNVwiO1xuXG5leHBvcnQgY29uc3QgTmF2YmFyID0gKHt9KSA9PiB7XG4gIGNvbnN0IHsgaGVpZ2h0LCB3aWR0aCB9ID0gdXNlV2luZG93U2l6ZSgpO1xuICBjb25zdCBpc01vYmlsZVZpZXcgPSB3aWR0aCA8IDYwMDtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XG4gIGNvbnN0IGZvbnRTaXplID0gaXNNb2JpbGVWaWV3ID8gXCIyMHB4XCIgOiBcIjIwcHhcIjtcblxuICBjb25zdCBoYW5kbGVOYXZpZ2F0aW9uID0gKHJvdXRlOiBzdHJpbmcpID0+IHtcbiAgICByb3V0ZXIucHVzaChyb3V0ZSk7XG4gIH07XG5cbiAgY29uc3QgbmF2SXRlbSA9ICh0ZXh0OiBzdHJpbmcsIHJvdXRlOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPEZsZXhcbiAgICAgICAgX2hvdmVyPXt7IGJhY2tncm91bmQ6IFwicmdiYSgyMDAsIDIwMCwgMjAwLCAwLjEpXCIgfX1cbiAgICAgICAgY3Vyc29yPVwicG9pbnRlclwiXG4gICAgICAgIGJvcmRlclJhZGl1cz1cIjZweFwiXG4gICAgICAgIG1yPVwiMTVweFwiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZU5hdmlnYXRpb24ocm91dGUpfVxuICAgICAgICBweD1cIjEwcHhcIlxuICAgICAgICBweT1cIjJweFwiXG4gICAgICAgIHBvc2l0aW9uPVwicmVsYXRpdmVcIiAvLyBFbnN1cmUgdGhlIEZsZXggY29udGFpbmVyIGlzIHJlbGF0aXZlXG4gICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIiAvLyBBbGlnbiBpdGVtcyB2ZXJ0aWNhbGx5IGF0IHRoZSBjZW50ZXJcbiAgICAgID5cbiAgICAgICAgPFRleHRcbiAgICAgICAgICBjb2xvcj17cm91dGVyLnBhdGhuYW1lID09IHJvdXRlID8gY29sb3JzLm9mZldoaXRlIDogY29sb3JzLnRleHRHcmF5fVxuICAgICAgICAgIGZvbnRTaXplPVwiMThweFwiXG4gICAgICAgID5cbiAgICAgICAgICB7dGV4dH1cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICB7cm91dGVyLnBhdGhuYW1lID09PSByb3V0ZSAmJiAoXG4gICAgICAgICAgPEZsZXhcbiAgICAgICAgICAgIHBvc2l0aW9uPXtcImFic29sdXRlXCJ9XG4gICAgICAgICAgICB0b3A9XCIyOHB4XCJcbiAgICAgICAgICAgIHc9e1xuICAgICAgICAgICAgICByb3V0ZXIucGF0aG5hbWUgPT09IFwiL2xpcXVpZGl0eVwiXG4gICAgICAgICAgICAgICAgPyBcIjEwMHB4XCJcbiAgICAgICAgICAgICAgICA6IHJvdXRlci5wYXRobmFtZSA9PT0gXCIvYWN0aXZpdHlcIlxuICAgICAgICAgICAgICAgID8gXCI5NHB4XCJcbiAgICAgICAgICAgICAgICA6IFwiNTlweFwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoZWlnaHQ9XCIycHhcIiAvLyBUaGlja25lc3Mgb2YgdGhlIHVuZGVybGluZVxuICAgICAgICAgICAgYmdHcmFkaWVudD17YGxpbmVhcih0by1yLCAke2NvbG9ycy5ncmFkaWVudDF9LCAke2NvbG9ycy5ncmFkaWVudDJ9KWB9XG4gICAgICAgICAgPjwvRmxleD5cbiAgICAgICAgKX1cbiAgICAgIDwvRmxleD5cbiAgICApO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEZsZXhcbiAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICBkaXJlY3Rpb249e1wiY29sdW1uXCJ9XG4gICAgICBwb3NpdGlvbj1cImZpeGVkXCJcbiAgICAgIHRvcD17MH1cbiAgICAgIGxlZnQ9ezB9XG4gICAgICByaWdodD17MH1cbiAgICAgIHpJbmRleD17MTAwMH1cbiAgICA+XG4gICAgICA8RmxleCBkaXJlY3Rpb249XCJyb3dcIiB3PVwiMTAwJVwiIHB4PXtcIjMwcHhcIn0gcHQ9XCIyNXB4XCI+XG4gICAgICAgIHtuYXZJdGVtKFwiSG9tZVwiLCBcIi9cIil9XG4gICAgICAgIHtuYXZJdGVtKFwiQWN0aXZpdHlcIiwgXCIvYWN0aXZpdHlcIil9XG4gICAgICAgIHtuYXZJdGVtKFwiTGlxdWlkaXR5XCIsIFwiL2xpcXVpZGl0eVwiKX1cbiAgICAgICAgPFNwYWNlciAvPlxuICAgICAgICA8RmxleD57LyogQ09OTkVDVCBXQUxMRVQgQlVUVE9OICovfTwvRmxleD5cbiAgICAgIDwvRmxleD5cbiAgICA8L0ZsZXg+XG4gICk7XG59O1xuIl0sIm5hbWVzIjpbIkZsZXgiLCJTcGFjZXIiLCJUZXh0IiwiY29sb3JzIiwidXNlV2luZG93U2l6ZSIsInVzZVJvdXRlciIsIk5hdmJhciIsImhlaWdodCIsIndpZHRoIiwiaXNNb2JpbGVWaWV3Iiwicm91dGVyIiwiZm9udFNpemUiLCJoYW5kbGVOYXZpZ2F0aW9uIiwicm91dGUiLCJwdXNoIiwibmF2SXRlbSIsInRleHQiLCJfaG92ZXIiLCJiYWNrZ3JvdW5kIiwiY3Vyc29yIiwiYm9yZGVyUmFkaXVzIiwibXIiLCJvbkNsaWNrIiwicHgiLCJweSIsInBvc2l0aW9uIiwiYWxpZ25JdGVtcyIsImNvbG9yIiwicGF0aG5hbWUiLCJvZmZXaGl0ZSIsInRleHRHcmF5IiwidG9wIiwidyIsImJnR3JhZGllbnQiLCJncmFkaWVudDEiLCJncmFkaWVudDIiLCJkaXJlY3Rpb24iLCJsZWZ0IiwicmlnaHQiLCJ6SW5kZXgiLCJwdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/components/Navbar.tsx\n"));

/***/ })

});