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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SwapUI\": function() { return /* binding */ SwapUI; }\n/* harmony export */ });\n/* harmony import */ var _swc_helpers_src_tagged_template_literal_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @swc/helpers/src/_tagged_template_literal.mjs */ \"./node_modules/@swc/helpers/src/_tagged_template_literal.mjs\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.esm.js\");\n/* harmony import */ var _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useWindowSize */ \"./src/hooks/useWindowSize.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! styled-components */ \"./node_modules/styled-components/dist/styled-components.browser.esm.js\");\n/* harmony import */ var _styles_colors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../styles/colors */ \"./src/styles/colors.ts\");\n\nfunction _templateObject() {\n    const data = (0,_swc_helpers_src_tagged_template_literal_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"])([\n        \"\\n    --r: 1.3em; /* Control the curvature */\\n    border-inline: var(--r) solid transparent;\\n    border-radius: 0 calc(2 * var(--r)) 0 0 / 1.6em var(--r) 0 0;\\n    border-left-width: 0;\\n    mask: radial-gradient(var(--r) at var(--r) 0, transparent 98%, black 101%)\\n        calc(-2 * var(--r)) 100% / 100% var(--r) repeat-x,\\n      conic-gradient(black 0 0) padding-box;\\n  \"\n    ]);\n    _templateObject = function() {\n        return data;\n    };\n    return data;\n}\nfunction _templateObject1() {\n    const data = (0,_swc_helpers_src_tagged_template_literal_mjs__WEBPACK_IMPORTED_MODULE_0__[\"default\"])([\n        \"\\n    --r: 1.3em; /* Control the curvature */\\n    border-inline: var(--r) solid transparent;\\n    border-radius: calc(2 * var(--r)) 0 0 0 / var(--r) 1.6em 0 0;\\n    border-right-width: 0;\\n    mask: radial-gradient(var(--r) at var(--r) 0, transparent 98%, black 101%)\\n        calc(-1 * var(--r)) 100% / 100% var(--r) repeat-x,\\n      conic-gradient(black 0 0) padding-box;\\n  \"\n    ]);\n    _templateObject1 = function() {\n        return data;\n    };\n    return data;\n}\n\nvar _s = $RefreshSig$();\n\n\n\n\n\n\nconst SwapUI = (param)=>{\n    let {} = param;\n    _s();\n    const { width  } = (0,_hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"])();\n    const isMobileView = width < 600;\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter)();\n    const fontSize = isMobileView ? \"20px\" : \"20px\";\n    const tabBackground = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.useColorModeValue)(\"gray.50\", \"gray.800\"); // Adjust the color mode based on your theme\n    const handleNavigation = (route)=>{\n        router.push(route);\n    };\n    const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(\"swap\");\n    const handleTabClick = (tabName)=>{\n        setActiveTab(tabName);\n    };\n    const RoundedTabLeft = (0,styled_components__WEBPACK_IMPORTED_MODULE_7__[\"default\"])(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Button)(_templateObject());\n    const RoundedTabRight = (0,styled_components__WEBPACK_IMPORTED_MODULE_7__[\"default\"])(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Button)(_templateObject1());\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Flex, {\n        width: \"580px\",\n        h: \"320px\",\n        bg: \"rgba(20, 20, 20, 0.55)\",\n        mt: \"30px\",\n        direction: \"column\",\n        borderRadius: \"20px\",\n        overflow: \"hidden\",\n        borderBottom: \"3px solid #9A96A2\",\n        borderLeft: \"3px solid #9A96A2\",\n        borderRight: \"3px solid #9A96A2\",\n        backdropFilter: \"blur(8px)\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Flex, {\n                justifyContent: \"center\",\n                w: \"100%\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(RoundedTabLeft, {\n                        w: \"100%\",\n                        mr: \"-19px\",\n                        bg: \"none\",\n                        color: activeTab === \"liquidity\" ? \"#9A96A2\" : _styles_colors__WEBPACK_IMPORTED_MODULE_5__[\"default\"].offWhite,\n                        _hover: {\n                            bg: \"\"\n                        },\n                        _active: {\n                            bg: \"\"\n                        },\n                        zIndex: activeTab === \"swap\" ? 1 : 0,\n                        onClick: ()=>handleTabClick(\"swap\"),\n                        variant: activeTab === \"swap\" ? \"solid\" : \"ghost\",\n                        border: activeTab === \"swap\" ? \"3px solid #9A96A2\" : \"\",\n                        children: \"Swap\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 70,\n                        columnNumber: 9\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(RoundedTabRight, {\n                        w: \"100%\",\n                        ml: \"-19px\",\n                        color: activeTab === \"swap\" ? \"#9A96A2\" : _styles_colors__WEBPACK_IMPORTED_MODULE_5__[\"default\"].offWhite,\n                        bg: \"none\",\n                        _hover: {\n                            bg: \"\"\n                        },\n                        _active: {\n                            bg: \"\"\n                        },\n                        zIndex: activeTab === \"liquidity\" ? 1 : 0,\n                        onClick: ()=>handleTabClick(\"liquidity\"),\n                        variant: activeTab === \"liquidity\" ? \"solid\" : \"ghost\",\n                        children: \"Provide Liquidity\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 84,\n                        columnNumber: 9\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                lineNumber: 68,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Flex, {\n                direction: \"column\",\n                p: \"4\",\n                flexGrow: 1,\n                children: [\n                    activeTab === \"swap\" && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Text, {\n                        fontSize: fontSize,\n                        children: \"Swap content goes here\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 102,\n                        columnNumber: 11\n                    }, undefined),\n                    activeTab === \"liquidity\" && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.Text, {\n                        fontSize: fontSize,\n                        children: \"Provide Liquidity content goes here\"\n                    }, void 0, false, {\n                        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                        lineNumber: 106,\n                        columnNumber: 11\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n                lineNumber: 100,\n                columnNumber: 7\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/barrett/Tristan/Projects/HyperBridge/rift/frontend/src/components/SwapUI.tsx\",\n        lineNumber: 55,\n        columnNumber: 5\n    }, undefined);\n};\n_s(SwapUI, \"bnGhnB79fQDG/0sod3qo4h5glIg=\", false, function() {\n    return [\n        _hooks_useWindowSize__WEBPACK_IMPORTED_MODULE_2__[\"default\"],\n        next_router__WEBPACK_IMPORTED_MODULE_3__.useRouter,\n        _chakra_ui_react__WEBPACK_IMPORTED_MODULE_6__.useColorModeValue\n    ];\n});\n_c = SwapUI;\nvar _c;\n$RefreshReg$(_c, \"SwapUI\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9Td2FwVUkudHN4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVMEI7QUFDeUI7QUFDWDtBQUNQO0FBQ007QUFDRDtBQUUvQixNQUFNUyxTQUFTLFNBQVE7UUFBUCxFQUFFOztJQUN2QixNQUFNLEVBQUVDLE1BQUssRUFBRSxHQUFHTixnRUFBYUE7SUFDL0IsTUFBTU8sZUFBZUQsUUFBUTtJQUM3QixNQUFNRSxTQUFTUCxzREFBU0E7SUFDeEIsTUFBTVEsV0FBV0YsZUFBZSxTQUFTLE1BQU07SUFDL0MsTUFBTUcsZ0JBQWdCWCxtRUFBaUJBLENBQUMsV0FBVyxhQUFhLDRDQUE0QztJQUU1RyxNQUFNWSxtQkFBbUIsQ0FBQ0MsUUFBa0I7UUFDMUNKLE9BQU9LLElBQUksQ0FBQ0Q7SUFDZDtJQUNBLE1BQU0sQ0FBQ0UsV0FBV0MsYUFBYSxHQUFHYiwrQ0FBUUEsQ0FBQztJQUUzQyxNQUFNYyxpQkFBaUIsQ0FBQ0MsVUFBb0I7UUFDMUNGLGFBQWFFO0lBQ2Y7SUFFQSxNQUFNQyxpQkFBaUJmLDZEQUFNQSxDQUFDUCxvREFBTUE7SUFVcEMsTUFBTXVCLGtCQUFrQmhCLDZEQUFNQSxDQUFDUCxvREFBTUE7SUFVckMscUJBQ0UsOERBQUNDLGtEQUFJQTtRQUNIUyxPQUFNO1FBQ05jLEdBQUU7UUFDRkMsSUFBRztRQUNIQyxJQUFHO1FBQ0hDLFdBQVc7UUFDWEMsY0FBYTtRQUNiQyxVQUFTO1FBQ1RDLGNBQWE7UUFDYkMsWUFBVztRQUNYQyxhQUFZO1FBQ1pDLGdCQUFlOzswQkFFZiw4REFBQ2hDLGtEQUFJQTtnQkFBQ2lDLGdCQUFlO2dCQUFTQyxHQUFFOztrQ0FFOUIsOERBQUNiO3dCQUNDYSxHQUFFO3dCQUNGQyxJQUFHO3dCQUNIWCxJQUFHO3dCQUNIWSxPQUFPbkIsY0FBYyxjQUFjLFlBQVlWLCtEQUFlO3dCQUM5RCtCLFFBQVE7NEJBQUVkLElBQUk7d0JBQUc7d0JBQ2pCZSxTQUFTOzRCQUFFZixJQUFJO3dCQUFHO3dCQUNsQmdCLFFBQVF2QixjQUFjLFNBQVMsSUFBSSxDQUFDO3dCQUNwQ3dCLFNBQVMsSUFBTXRCLGVBQWU7d0JBQzlCdUIsU0FBU3pCLGNBQWMsU0FBUyxVQUFVLE9BQU87d0JBQ2pEMEIsUUFBUTFCLGNBQWMsU0FBUyxzQkFBc0IsRUFBRTtrQ0FDeEQ7Ozs7OztrQ0FHRCw4REFBQ0s7d0JBQ0NZLEdBQUU7d0JBQ0ZVLElBQUc7d0JBQ0hSLE9BQU9uQixjQUFjLFNBQVMsWUFBWVYsK0RBQWU7d0JBQ3pEaUIsSUFBRzt3QkFDSGMsUUFBUTs0QkFBRWQsSUFBSTt3QkFBRzt3QkFDakJlLFNBQVM7NEJBQUVmLElBQUk7d0JBQUc7d0JBQ2xCZ0IsUUFBUXZCLGNBQWMsY0FBYyxJQUFJLENBQUM7d0JBQ3pDd0IsU0FBUyxJQUFNdEIsZUFBZTt3QkFDOUJ1QixTQUFTekIsY0FBYyxjQUFjLFVBQVUsT0FBTztrQ0FDdkQ7Ozs7Ozs7Ozs7OzswQkFNSCw4REFBQ2pCLGtEQUFJQTtnQkFBQzBCLFdBQVU7Z0JBQVNtQixHQUFFO2dCQUFJQyxVQUFVOztvQkFDdEM3QixjQUFjLHdCQUNiLDhEQUFDaEIsa0RBQUlBO3dCQUFDVyxVQUFVQTtrQ0FBVTs7Ozs7O29CQUczQkssY0FBYyw2QkFDYiw4REFBQ2hCLGtEQUFJQTt3QkFBQ1csVUFBVUE7a0NBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1wQyxFQUFFO0dBOUZXSjs7UUFDT0wsNERBQWFBO1FBRWhCQyxrREFBU0E7UUFFRkYsK0RBQWlCQTs7O0tBTDVCTSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvY29tcG9uZW50cy9Td2FwVUkudHN4P2ZlMzIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgVGFicyxcbiAgVGFiTGlzdCxcbiAgVGFiUGFuZWxzLFxuICBUYWIsXG4gIEJ1dHRvbixcbiAgRmxleCxcbiAgVGV4dCxcbiAgdXNlQ29sb3JNb2RlVmFsdWUsXG4gIEJveCxcbn0gZnJvbSBcIkBjaGFrcmEtdWkvcmVhY3RcIjtcbmltcG9ydCB1c2VXaW5kb3dTaXplIGZyb20gXCIuLi9ob29rcy91c2VXaW5kb3dTaXplXCI7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tIFwibmV4dC9yb3V0ZXJcIjtcbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgc3R5bGVkIGZyb20gXCJzdHlsZWQtY29tcG9uZW50c1wiO1xuaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vc3R5bGVzL2NvbG9yc1wiO1xuXG5leHBvcnQgY29uc3QgU3dhcFVJID0gKHt9KSA9PiB7XG4gIGNvbnN0IHsgd2lkdGggfSA9IHVzZVdpbmRvd1NpemUoKTtcbiAgY29uc3QgaXNNb2JpbGVWaWV3ID0gd2lkdGggPCA2MDA7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuICBjb25zdCBmb250U2l6ZSA9IGlzTW9iaWxlVmlldyA/IFwiMjBweFwiIDogXCIyMHB4XCI7XG4gIGNvbnN0IHRhYkJhY2tncm91bmQgPSB1c2VDb2xvck1vZGVWYWx1ZShcImdyYXkuNTBcIiwgXCJncmF5LjgwMFwiKTsgLy8gQWRqdXN0IHRoZSBjb2xvciBtb2RlIGJhc2VkIG9uIHlvdXIgdGhlbWVcblxuICBjb25zdCBoYW5kbGVOYXZpZ2F0aW9uID0gKHJvdXRlOiBzdHJpbmcpID0+IHtcbiAgICByb3V0ZXIucHVzaChyb3V0ZSk7XG4gIH07XG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZShcInN3YXBcIik7XG5cbiAgY29uc3QgaGFuZGxlVGFiQ2xpY2sgPSAodGFiTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgc2V0QWN0aXZlVGFiKHRhYk5hbWUpO1xuICB9O1xuXG4gIGNvbnN0IFJvdW5kZWRUYWJMZWZ0ID0gc3R5bGVkKEJ1dHRvbilgXG4gICAgLS1yOiAxLjNlbTsgLyogQ29udHJvbCB0aGUgY3VydmF0dXJlICovXG4gICAgYm9yZGVyLWlubGluZTogdmFyKC0tcikgc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgYm9yZGVyLXJhZGl1czogMCBjYWxjKDIgKiB2YXIoLS1yKSkgMCAwIC8gMS42ZW0gdmFyKC0tcikgMCAwO1xuICAgIGJvcmRlci1sZWZ0LXdpZHRoOiAwO1xuICAgIG1hc2s6IHJhZGlhbC1ncmFkaWVudCh2YXIoLS1yKSBhdCB2YXIoLS1yKSAwLCB0cmFuc3BhcmVudCA5OCUsIGJsYWNrIDEwMSUpXG4gICAgICAgIGNhbGMoLTIgKiB2YXIoLS1yKSkgMTAwJSAvIDEwMCUgdmFyKC0tcikgcmVwZWF0LXgsXG4gICAgICBjb25pYy1ncmFkaWVudChibGFjayAwIDApIHBhZGRpbmctYm94O1xuICBgO1xuXG4gIGNvbnN0IFJvdW5kZWRUYWJSaWdodCA9IHN0eWxlZChCdXR0b24pYFxuICAgIC0tcjogMS4zZW07IC8qIENvbnRyb2wgdGhlIGN1cnZhdHVyZSAqL1xuICAgIGJvcmRlci1pbmxpbmU6IHZhcigtLXIpIHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yYWRpdXM6IGNhbGMoMiAqIHZhcigtLXIpKSAwIDAgMCAvIHZhcigtLXIpIDEuNmVtIDAgMDtcbiAgICBib3JkZXItcmlnaHQtd2lkdGg6IDA7XG4gICAgbWFzazogcmFkaWFsLWdyYWRpZW50KHZhcigtLXIpIGF0IHZhcigtLXIpIDAsIHRyYW5zcGFyZW50IDk4JSwgYmxhY2sgMTAxJSlcbiAgICAgICAgY2FsYygtMSAqIHZhcigtLXIpKSAxMDAlIC8gMTAwJSB2YXIoLS1yKSByZXBlYXQteCxcbiAgICAgIGNvbmljLWdyYWRpZW50KGJsYWNrIDAgMCkgcGFkZGluZy1ib3g7XG4gIGA7XG5cbiAgcmV0dXJuIChcbiAgICA8RmxleFxuICAgICAgd2lkdGg9XCI1ODBweFwiXG4gICAgICBoPVwiMzIwcHhcIlxuICAgICAgYmc9XCJyZ2JhKDIwLCAyMCwgMjAsIDAuNTUpXCJcbiAgICAgIG10PVwiMzBweFwiXG4gICAgICBkaXJlY3Rpb249e1wiY29sdW1uXCJ9XG4gICAgICBib3JkZXJSYWRpdXM9XCIyMHB4XCJcbiAgICAgIG92ZXJmbG93PVwiaGlkZGVuXCJcbiAgICAgIGJvcmRlckJvdHRvbT1cIjNweCBzb2xpZCAjOUE5NkEyXCJcbiAgICAgIGJvcmRlckxlZnQ9XCIzcHggc29saWQgIzlBOTZBMlwiXG4gICAgICBib3JkZXJSaWdodD1cIjNweCBzb2xpZCAjOUE5NkEyXCJcbiAgICAgIGJhY2tkcm9wRmlsdGVyPVwiYmx1cig4cHgpXCJcbiAgICA+XG4gICAgICA8RmxleCBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIHc9XCIxMDAlXCI+XG4gICAgICAgIHsvKiBUYWIgQnV0dG9ucyAqL31cbiAgICAgICAgPFJvdW5kZWRUYWJMZWZ0XG4gICAgICAgICAgdz1cIjEwMCVcIlxuICAgICAgICAgIG1yPVwiLTE5cHhcIlxuICAgICAgICAgIGJnPVwibm9uZVwiXG4gICAgICAgICAgY29sb3I9e2FjdGl2ZVRhYiA9PT0gXCJsaXF1aWRpdHlcIiA/IFwiIzlBOTZBMlwiIDogY29sb3JzLm9mZldoaXRlfVxuICAgICAgICAgIF9ob3Zlcj17eyBiZzogXCJcIiB9fVxuICAgICAgICAgIF9hY3RpdmU9e3sgYmc6IFwiXCIgfX1cbiAgICAgICAgICB6SW5kZXg9e2FjdGl2ZVRhYiA9PT0gXCJzd2FwXCIgPyAxIDogMH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVUYWJDbGljayhcInN3YXBcIil9XG4gICAgICAgICAgdmFyaWFudD17YWN0aXZlVGFiID09PSBcInN3YXBcIiA/IFwic29saWRcIiA6IFwiZ2hvc3RcIn1cbiAgICAgICAgICBib3JkZXI9e2FjdGl2ZVRhYiA9PT0gXCJzd2FwXCIgPyBcIjNweCBzb2xpZCAjOUE5NkEyXCIgOiBcIlwifVxuICAgICAgICA+XG4gICAgICAgICAgU3dhcFxuICAgICAgICA8L1JvdW5kZWRUYWJMZWZ0PlxuICAgICAgICA8Um91bmRlZFRhYlJpZ2h0XG4gICAgICAgICAgdz1cIjEwMCVcIlxuICAgICAgICAgIG1sPVwiLTE5cHhcIlxuICAgICAgICAgIGNvbG9yPXthY3RpdmVUYWIgPT09IFwic3dhcFwiID8gXCIjOUE5NkEyXCIgOiBjb2xvcnMub2ZmV2hpdGV9XG4gICAgICAgICAgYmc9XCJub25lXCJcbiAgICAgICAgICBfaG92ZXI9e3sgYmc6IFwiXCIgfX1cbiAgICAgICAgICBfYWN0aXZlPXt7IGJnOiBcIlwiIH19XG4gICAgICAgICAgekluZGV4PXthY3RpdmVUYWIgPT09IFwibGlxdWlkaXR5XCIgPyAxIDogMH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVUYWJDbGljayhcImxpcXVpZGl0eVwiKX1cbiAgICAgICAgICB2YXJpYW50PXthY3RpdmVUYWIgPT09IFwibGlxdWlkaXR5XCIgPyBcInNvbGlkXCIgOiBcImdob3N0XCJ9XG4gICAgICAgID5cbiAgICAgICAgICBQcm92aWRlIExpcXVpZGl0eVxuICAgICAgICA8L1JvdW5kZWRUYWJSaWdodD5cbiAgICAgIDwvRmxleD5cblxuICAgICAgey8qIENvbnRlbnQgKi99XG4gICAgICA8RmxleCBkaXJlY3Rpb249XCJjb2x1bW5cIiBwPVwiNFwiIGZsZXhHcm93PXsxfT5cbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gXCJzd2FwXCIgJiYgKFxuICAgICAgICAgIDxUZXh0IGZvbnRTaXplPXtmb250U2l6ZX0+U3dhcCBjb250ZW50IGdvZXMgaGVyZTwvVGV4dD5cbiAgICAgICAgICAvLyBBZGQgeW91ciBzd2FwIGNvbXBvbmVudHMgb3IgY29udGVudCBoZXJlXG4gICAgICAgICl9XG4gICAgICAgIHthY3RpdmVUYWIgPT09IFwibGlxdWlkaXR5XCIgJiYgKFxuICAgICAgICAgIDxUZXh0IGZvbnRTaXplPXtmb250U2l6ZX0+UHJvdmlkZSBMaXF1aWRpdHkgY29udGVudCBnb2VzIGhlcmU8L1RleHQ+XG4gICAgICAgICAgLy8gQWRkIHlvdXIgcHJvdmlkZSBsaXF1aWRpdHkgY29tcG9uZW50cyBvciBjb250ZW50IGhlcmVcbiAgICAgICAgKX1cbiAgICAgIDwvRmxleD5cbiAgICA8L0ZsZXg+XG4gICk7XG59O1xuIl0sIm5hbWVzIjpbIkJ1dHRvbiIsIkZsZXgiLCJUZXh0IiwidXNlQ29sb3JNb2RlVmFsdWUiLCJ1c2VXaW5kb3dTaXplIiwidXNlUm91dGVyIiwidXNlU3RhdGUiLCJzdHlsZWQiLCJjb2xvcnMiLCJTd2FwVUkiLCJ3aWR0aCIsImlzTW9iaWxlVmlldyIsInJvdXRlciIsImZvbnRTaXplIiwidGFiQmFja2dyb3VuZCIsImhhbmRsZU5hdmlnYXRpb24iLCJyb3V0ZSIsInB1c2giLCJhY3RpdmVUYWIiLCJzZXRBY3RpdmVUYWIiLCJoYW5kbGVUYWJDbGljayIsInRhYk5hbWUiLCJSb3VuZGVkVGFiTGVmdCIsIlJvdW5kZWRUYWJSaWdodCIsImgiLCJiZyIsIm10IiwiZGlyZWN0aW9uIiwiYm9yZGVyUmFkaXVzIiwib3ZlcmZsb3ciLCJib3JkZXJCb3R0b20iLCJib3JkZXJMZWZ0IiwiYm9yZGVyUmlnaHQiLCJiYWNrZHJvcEZpbHRlciIsImp1c3RpZnlDb250ZW50IiwidyIsIm1yIiwiY29sb3IiLCJvZmZXaGl0ZSIsIl9ob3ZlciIsIl9hY3RpdmUiLCJ6SW5kZXgiLCJvbkNsaWNrIiwidmFyaWFudCIsImJvcmRlciIsIm1sIiwicCIsImZsZXhHcm93Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/components/SwapUI.tsx\n"));

/***/ })

});