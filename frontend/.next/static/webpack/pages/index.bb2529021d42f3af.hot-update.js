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

/***/ "./src/components/SwapUI.tsx":
/*!***********************************!*\
  !*** ./src/components/SwapUI.tsx ***!
  \***********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SwapUI\": function() { return /* binding */ SwapUI; }\n/* harmony export */ });\n/* harmony import */ var _swc_helpers_src_tagged_template_literal_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @swc/helpers/src/_tagged_template_literal.mjs */ \"./node_modules/@swc/helpers/src/_tagged_template_literal.mjs\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useWindowSize */ \"./src/hooks/useWindowSize.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! styled-components */ \"./node_modules/styled-components/dist/styled-components.browser.esm.js\");\n\nfunction _templateObject() {\n    const data = (0,_swc_helpers_src_tagged_template_literal_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"])([\n        \"\\n    --r: 1.3em; /* Control the curvature */\\n    border-inline: var(--r) solid transparent;\\n    border-radius: 0 calc(2 * var(--r)) 0 0 / 1.6em var(--r) 0 0;\\n    border-left-width: 0;\\n    mask: radial-gradient(var(--r) at var(--r) 0, transparent 98%, black 101%)\\n        calc(-1 * var(--r)) 100% / 100% var(--r) repeat-x,\\n      conic-gradient(black 0 0) padding-box;\\n  \"\n    ]);\n    _templateObject = function() {\n        return data;\n    };\n    return data;\n}\nfunction _templateObject1() {\n    const data = (0,_swc_helpers_src_tagged_template_literal_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"])([\n        \"\\n    --r: 1.3em; /* Control the curvature */\\n    border-inline: var(--r) solid transparent;\\n    border-radius: calc(2 * var(--r)) 0 0 0 / var(--r) 1.6em 0 0;\\n    border-right-width: 0;\\n    mask: radial-gradient(var(--r) at var(--r) 0, transparent 98%, black 101%)\\n        calc(-1 * var(--r)) 100% / 100% var(--r) repeat-x,\\n      conic-gradient(black 0 0) padding-box;\\n  \"\n    ]);\n    _templateObject1 = function() {\n        return data;\n    };\n    return data;\n}\n\nvar _s = $RefreshSig$();\n\n\n\n\n\nconst SwapUI = (param)=>{\n    let {} = param;\n    _s();\n    const { width  } = (0,_hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    const isMobileView = width < 600;\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const fontSize = isMobileView ? \"20px\" : \"20px\";\n    const tabBackground = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.useColorModeValue)(\"gray.50\", \"gray.800\"); // Adjust the color mode based on your theme\n    const handleNavigation = (route)=>{\n        router.push(route);\n    };\n    const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(\"swap\");\n    const handleTabClick = (tabName)=>{\n        setActiveTab(tabName);\n    };\n    const RoundedTabLeft = (0,styled_components__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Button)(_templateObject());\n    const RoundedTabRight = (0,styled_components__WEBPACK_IMPORTED_MODULE_6__[\"default\"])(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Button)(_templateObject1());\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Flex, {\n        width: \"580px\",\n        h: \"320px\",\n        bg: \"rgba(20, 20, 20, 0.55)\",\n        mt: \"30px\",\n        direction: \"column\",\n        borderRadius: \"20px\",\n        overflow: \"hidden\",\n        backdropFilter: \"blur(8px)\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Flex, {\n                justifyContent: \"center\",\n                w: \"100%\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(RoundedTabLeft, {\n                        w: \"100%\",\n                        mr: \"-19px\",\n                        bg: \"none\",\n                        _hover: {\n                            bg: \"\"\n                        },\n                        _active: {\n                            bg: \"\"\n                        },\n                        zIndex: activeTab === \"swap\" ? 1 : 0,\n                        onClick: ()=>handleTabClick(\"swap\"),\n                        variant: activeTab === \"swap\" ? \"solid\" : \"ghost\",\n                        children: \"Swap\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 66,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(RoundedTabRight, {\n                        w: \"100%\",\n                        ml: \"-19px\",\n                        bg: activeTab === \"liquidity\" ? \"rgba(0, 0, 0, 0.1)\" : \"none\",\n                        _hover: {\n                            bg: \"\"\n                        },\n                        _active: {\n                            bg: \"\"\n                        },\n                        zIndex: activeTab === \"liquidity\" ? 1 : 0,\n                        onClick: ()=>handleTabClick(\"liquidity\"),\n                        variant: activeTab === \"liquidity\" ? \"solid\" : \"ghost\",\n                        children: \"Provide Liquidity\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 78,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                lineNumber: 64,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Flex, {\n                direction: \"column\",\n                p: \"4\",\n                flexGrow: 1,\n                children: [\n                    activeTab === \"swap\" && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Text, {\n                        fontSize: fontSize,\n                        children: \"Swap content goes here\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 95,\n                        columnNumber: 11\n                    }, undefined),\n                    activeTab === \"liquidity\" && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.Text, {\n                        fontSize: fontSize,\n                        children: \"Provide Liquidity content goes here\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 99,\n                        columnNumber: 11\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                lineNumber: 93,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n        lineNumber: 54,\n        columnNumber: 5\n    }, undefined);\n};\n_s(SwapUI, \"bnGhnB79fQDG/0sod3qo4h5glIg=\", false, function() {\n    return [\n        _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter,\n        _chakra_ui_react__WEBPACK_IMPORTED_MODULE_5__.useColorModeValue\n    ];\n});\n_c = SwapUI;\nvar _c;\n$RefreshReg$(_c, \"SwapUI\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9Td2FwVUkudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVUwQjtBQUN5QjtBQUNYO0FBQ1A7QUFDTTtBQUVoQyxNQUFNUSxTQUFTLFNBQVE7UUFBUCxFQUFFOztJQUN2QixNQUFNLEVBQUVDLE1BQUssRUFBRSxHQUFHTCxnRUFBYUE7SUFDL0IsTUFBTU0sZUFBZUQsUUFBUTtJQUM3QixNQUFNRSxTQUFTTixzREFBU0E7SUFDeEIsTUFBTU8sV0FBV0YsZUFBZSxTQUFTLE1BQU07SUFDL0MsTUFBTUcsZ0JBQWdCVixtRUFBaUJBLENBQUMsV0FBVyxhQUFhLDRDQUE0QztJQUU1RyxNQUFNVyxtQkFBbUIsQ0FBQ0MsUUFBa0I7UUFDMUNKLE9BQU9LLElBQUksQ0FBQ0Q7SUFDZDtJQUNBLE1BQU0sQ0FBQ0UsV0FBV0MsYUFBYSxHQUFHWiwrQ0FBUUEsQ0FBQztJQUUzQyxNQUFNYSxpQkFBaUIsQ0FBQ0MsVUFBb0I7UUFDMUNGLGFBQWFFO0lBQ2Y7SUFFQSxNQUFNQyxpQkFBaUJkLDZEQUFNQSxDQUFDUCxvREFBTUE7SUFVcEMsTUFBTXNCLGtCQUFrQmYsNkRBQU1BLENBQUNQLG9EQUFNQTtJQVVyQyxxQkFDRSw4REFBQ0Msa0RBQUlBO1FBQ0hRLE9BQU07UUFDTmMsR0FBRTtRQUNGQyxJQUFHO1FBQ0hDLElBQUc7UUFDSEMsV0FBVztRQUNYQyxjQUFhO1FBQ2JDLFVBQVM7UUFDVEMsZ0JBQWU7OzBCQUVmLDhEQUFDNUIsa0RBQUlBO2dCQUFDNkIsZ0JBQWU7Z0JBQVNDLEdBQUU7O2tDQUU5Qiw4REFBQ1Y7d0JBQ0NVLEdBQUU7d0JBQ0ZDLElBQUc7d0JBQ0hSLElBQUc7d0JBQ0hTLFFBQVE7NEJBQUVULElBQUk7d0JBQUc7d0JBQ2pCVSxTQUFTOzRCQUFFVixJQUFJO3dCQUFHO3dCQUNsQlcsUUFBUWxCLGNBQWMsU0FBUyxJQUFJLENBQUM7d0JBQ3BDbUIsU0FBUyxJQUFNakIsZUFBZTt3QkFDOUJrQixTQUFTcEIsY0FBYyxTQUFTLFVBQVUsT0FBTztrQ0FDbEQ7Ozs7OztrQ0FHRCw4REFBQ0s7d0JBQ0NTLEdBQUU7d0JBQ0ZPLElBQUc7d0JBQ0hkLElBQUlQLGNBQWMsY0FBYyx1QkFBdUIsTUFBTTt3QkFDN0RnQixRQUFROzRCQUFFVCxJQUFJO3dCQUFHO3dCQUNqQlUsU0FBUzs0QkFBRVYsSUFBSTt3QkFBRzt3QkFDbEJXLFFBQVFsQixjQUFjLGNBQWMsSUFBSSxDQUFDO3dCQUN6Q21CLFNBQVMsSUFBTWpCLGVBQWU7d0JBQzlCa0IsU0FBU3BCLGNBQWMsY0FBYyxVQUFVLE9BQU87a0NBQ3ZEOzs7Ozs7Ozs7Ozs7MEJBTUgsOERBQUNoQixrREFBSUE7Z0JBQUN5QixXQUFVO2dCQUFTYSxHQUFFO2dCQUFJQyxVQUFVOztvQkFDdEN2QixjQUFjLHdCQUNiLDhEQUFDZixrREFBSUE7d0JBQUNVLFVBQVVBO2tDQUFVOzs7Ozs7b0JBRzNCSyxjQUFjLDZCQUNiLDhEQUFDZixrREFBSUE7d0JBQUNVLFVBQVVBO2tDQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNcEMsRUFBRTtHQXhGV0o7O1FBQ09KLDREQUFhQTtRQUVoQkMsa0RBQVNBO1FBRUZGLCtEQUFpQkE7OztLQUw1QksiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvU3dhcFVJLnRzeD9mZTMyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFRhYnMsXG4gIFRhYkxpc3QsXG4gIFRhYlBhbmVscyxcbiAgVGFiLFxuICBCdXR0b24sXG4gIEZsZXgsXG4gIFRleHQsXG4gIHVzZUNvbG9yTW9kZVZhbHVlLFxuICBCb3gsXG59IGZyb20gXCJAY2hha3JhLXVpL3JlYWN0XCI7XG5pbXBvcnQgdXNlV2luZG93U2l6ZSBmcm9tIFwiLi4vaG9va3MvdXNlV2luZG93U2l6ZVwiO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSBcIm5leHQvcm91dGVyXCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHN0eWxlZCBmcm9tIFwic3R5bGVkLWNvbXBvbmVudHNcIjtcblxuZXhwb3J0IGNvbnN0IFN3YXBVSSA9ICh7fSkgPT4ge1xuICBjb25zdCB7IHdpZHRoIH0gPSB1c2VXaW5kb3dTaXplKCk7XG4gIGNvbnN0IGlzTW9iaWxlVmlldyA9IHdpZHRoIDwgNjAwO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgZm9udFNpemUgPSBpc01vYmlsZVZpZXcgPyBcIjIwcHhcIiA6IFwiMjBweFwiO1xuICBjb25zdCB0YWJCYWNrZ3JvdW5kID0gdXNlQ29sb3JNb2RlVmFsdWUoXCJncmF5LjUwXCIsIFwiZ3JheS44MDBcIik7IC8vIEFkanVzdCB0aGUgY29sb3IgbW9kZSBiYXNlZCBvbiB5b3VyIHRoZW1lXG5cbiAgY29uc3QgaGFuZGxlTmF2aWdhdGlvbiA9IChyb3V0ZTogc3RyaW5nKSA9PiB7XG4gICAgcm91dGVyLnB1c2gocm91dGUpO1xuICB9O1xuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGUoXCJzd2FwXCIpO1xuXG4gIGNvbnN0IGhhbmRsZVRhYkNsaWNrID0gKHRhYk5hbWU6IHN0cmluZykgPT4ge1xuICAgIHNldEFjdGl2ZVRhYih0YWJOYW1lKTtcbiAgfTtcblxuICBjb25zdCBSb3VuZGVkVGFiTGVmdCA9IHN0eWxlZChCdXR0b24pYFxuICAgIC0tcjogMS4zZW07IC8qIENvbnRyb2wgdGhlIGN1cnZhdHVyZSAqL1xuICAgIGJvcmRlci1pbmxpbmU6IHZhcigtLXIpIHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yYWRpdXM6IDAgY2FsYygyICogdmFyKC0tcikpIDAgMCAvIDEuNmVtIHZhcigtLXIpIDAgMDtcbiAgICBib3JkZXItbGVmdC13aWR0aDogMDtcbiAgICBtYXNrOiByYWRpYWwtZ3JhZGllbnQodmFyKC0tcikgYXQgdmFyKC0tcikgMCwgdHJhbnNwYXJlbnQgOTglLCBibGFjayAxMDElKVxuICAgICAgICBjYWxjKC0xICogdmFyKC0tcikpIDEwMCUgLyAxMDAlIHZhcigtLXIpIHJlcGVhdC14LFxuICAgICAgY29uaWMtZ3JhZGllbnQoYmxhY2sgMCAwKSBwYWRkaW5nLWJveDtcbiAgYDtcblxuICBjb25zdCBSb3VuZGVkVGFiUmlnaHQgPSBzdHlsZWQoQnV0dG9uKWBcbiAgICAtLXI6IDEuM2VtOyAvKiBDb250cm9sIHRoZSBjdXJ2YXR1cmUgKi9cbiAgICBib3JkZXItaW5saW5lOiB2YXIoLS1yKSBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICBib3JkZXItcmFkaXVzOiBjYWxjKDIgKiB2YXIoLS1yKSkgMCAwIDAgLyB2YXIoLS1yKSAxLjZlbSAwIDA7XG4gICAgYm9yZGVyLXJpZ2h0LXdpZHRoOiAwO1xuICAgIG1hc2s6IHJhZGlhbC1ncmFkaWVudCh2YXIoLS1yKSBhdCB2YXIoLS1yKSAwLCB0cmFuc3BhcmVudCA5OCUsIGJsYWNrIDEwMSUpXG4gICAgICAgIGNhbGMoLTEgKiB2YXIoLS1yKSkgMTAwJSAvIDEwMCUgdmFyKC0tcikgcmVwZWF0LXgsXG4gICAgICBjb25pYy1ncmFkaWVudChibGFjayAwIDApIHBhZGRpbmctYm94O1xuICBgO1xuXG4gIHJldHVybiAoXG4gICAgPEZsZXhcbiAgICAgIHdpZHRoPVwiNTgwcHhcIlxuICAgICAgaD1cIjMyMHB4XCJcbiAgICAgIGJnPVwicmdiYSgyMCwgMjAsIDIwLCAwLjU1KVwiXG4gICAgICBtdD1cIjMwcHhcIlxuICAgICAgZGlyZWN0aW9uPXtcImNvbHVtblwifVxuICAgICAgYm9yZGVyUmFkaXVzPVwiMjBweFwiXG4gICAgICBvdmVyZmxvdz1cImhpZGRlblwiXG4gICAgICBiYWNrZHJvcEZpbHRlcj1cImJsdXIoOHB4KVwiXG4gICAgPlxuICAgICAgPEZsZXgganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIiB3PVwiMTAwJVwiPlxuICAgICAgICB7LyogVGFiIEJ1dHRvbnMgKi99XG4gICAgICAgIDxSb3VuZGVkVGFiTGVmdFxuICAgICAgICAgIHc9XCIxMDAlXCJcbiAgICAgICAgICBtcj1cIi0xOXB4XCJcbiAgICAgICAgICBiZz1cIm5vbmVcIlxuICAgICAgICAgIF9ob3Zlcj17eyBiZzogXCJcIiB9fVxuICAgICAgICAgIF9hY3RpdmU9e3sgYmc6IFwiXCIgfX1cbiAgICAgICAgICB6SW5kZXg9e2FjdGl2ZVRhYiA9PT0gXCJzd2FwXCIgPyAxIDogMH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVUYWJDbGljayhcInN3YXBcIil9XG4gICAgICAgICAgdmFyaWFudD17YWN0aXZlVGFiID09PSBcInN3YXBcIiA/IFwic29saWRcIiA6IFwiZ2hvc3RcIn1cbiAgICAgICAgPlxuICAgICAgICAgIFN3YXBcbiAgICAgICAgPC9Sb3VuZGVkVGFiTGVmdD5cbiAgICAgICAgPFJvdW5kZWRUYWJSaWdodFxuICAgICAgICAgIHc9XCIxMDAlXCJcbiAgICAgICAgICBtbD1cIi0xOXB4XCJcbiAgICAgICAgICBiZz17YWN0aXZlVGFiID09PSBcImxpcXVpZGl0eVwiID8gXCJyZ2JhKDAsIDAsIDAsIDAuMSlcIiA6IFwibm9uZVwifVxuICAgICAgICAgIF9ob3Zlcj17eyBiZzogXCJcIiB9fVxuICAgICAgICAgIF9hY3RpdmU9e3sgYmc6IFwiXCIgfX1cbiAgICAgICAgICB6SW5kZXg9e2FjdGl2ZVRhYiA9PT0gXCJsaXF1aWRpdHlcIiA/IDEgOiAwfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVRhYkNsaWNrKFwibGlxdWlkaXR5XCIpfVxuICAgICAgICAgIHZhcmlhbnQ9e2FjdGl2ZVRhYiA9PT0gXCJsaXF1aWRpdHlcIiA/IFwic29saWRcIiA6IFwiZ2hvc3RcIn1cbiAgICAgICAgPlxuICAgICAgICAgIFByb3ZpZGUgTGlxdWlkaXR5XG4gICAgICAgIDwvUm91bmRlZFRhYlJpZ2h0PlxuICAgICAgPC9GbGV4PlxuXG4gICAgICB7LyogQ29udGVudCAqL31cbiAgICAgIDxGbGV4IGRpcmVjdGlvbj1cImNvbHVtblwiIHA9XCI0XCIgZmxleEdyb3c9ezF9PlxuICAgICAgICB7YWN0aXZlVGFiID09PSBcInN3YXBcIiAmJiAoXG4gICAgICAgICAgPFRleHQgZm9udFNpemU9e2ZvbnRTaXplfT5Td2FwIGNvbnRlbnQgZ29lcyBoZXJlPC9UZXh0PlxuICAgICAgICAgIC8vIEFkZCB5b3VyIHN3YXAgY29tcG9uZW50cyBvciBjb250ZW50IGhlcmVcbiAgICAgICAgKX1cbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gXCJsaXF1aWRpdHlcIiAmJiAoXG4gICAgICAgICAgPFRleHQgZm9udFNpemU9e2ZvbnRTaXplfT5Qcm92aWRlIExpcXVpZGl0eSBjb250ZW50IGdvZXMgaGVyZTwvVGV4dD5cbiAgICAgICAgICAvLyBBZGQgeW91ciBwcm92aWRlIGxpcXVpZGl0eSBjb21wb25lbnRzIG9yIGNvbnRlbnQgaGVyZVxuICAgICAgICApfVxuICAgICAgPC9GbGV4PlxuICAgIDwvRmxleD5cbiAgKTtcbn07XG4iXSwibmFtZXMiOlsiQnV0dG9uIiwiRmxleCIsIlRleHQiLCJ1c2VDb2xvck1vZGVWYWx1ZSIsInVzZVdpbmRvd1NpemUiLCJ1c2VSb3V0ZXIiLCJ1c2VTdGF0ZSIsInN0eWxlZCIsIlN3YXBVSSIsIndpZHRoIiwiaXNNb2JpbGVWaWV3Iiwicm91dGVyIiwiZm9udFNpemUiLCJ0YWJCYWNrZ3JvdW5kIiwiaGFuZGxlTmF2aWdhdGlvbiIsInJvdXRlIiwicHVzaCIsImFjdGl2ZVRhYiIsInNldEFjdGl2ZVRhYiIsImhhbmRsZVRhYkNsaWNrIiwidGFiTmFtZSIsIlJvdW5kZWRUYWJMZWZ0IiwiUm91bmRlZFRhYlJpZ2h0IiwiaCIsImJnIiwibXQiLCJkaXJlY3Rpb24iLCJib3JkZXJSYWRpdXMiLCJvdmVyZmxvdyIsImJhY2tkcm9wRmlsdGVyIiwianVzdGlmeUNvbnRlbnQiLCJ3IiwibXIiLCJfaG92ZXIiLCJfYWN0aXZlIiwiekluZGV4Iiwib25DbGljayIsInZhcmlhbnQiLCJtbCIsInAiLCJmbGV4R3JvdyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/components/SwapUI.tsx\n"));

/***/ })

});