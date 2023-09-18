"use strict";(globalThis.webpackChunk_spectrum_css_preview=globalThis.webpackChunk_spectrum_css_preview||[]).push([[8161],{"../../components/icon/stories/icon.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _template__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../components/icon/stories/template.js"),_utilities_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../components/icon/stories/utilities.js");const __WEBPACK_DEFAULT_EXPORT__={title:"Components/Icon",description:"The icons component contains all UI icons used for components as well as the CSS for UI and workflow icons.",component:"Icon",argTypes:{express:{table:{disable:!0}},reducedMotion:{table:{disable:!0}},size:{name:"Size",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Component"},options:["s","m","l","xl","xxl"],control:"select"},setName:{name:"Icon set",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Content"},options:["ui","workflow"],control:"inline-radio"},iconName:{name:"Workflow icons",type:{name:"string"},table:{type:{summary:"string"},category:"Content"},options:_utilities_js__WEBPACK_IMPORTED_MODULE_1__.aX,control:"select",if:{arg:"setName",eq:"workflow"}},uiIconName:{name:"UI icons",type:{name:"string"},table:{type:{summary:"string"},category:"Content"},options:_utilities_js__WEBPACK_IMPORTED_MODULE_1__.qy,control:"select",if:{arg:"setName",eq:"ui"}},fill:{name:"Fill color",type:{name:"string"},table:{type:{summary:"string"},category:"Advanced"},control:"color"},useRef:{table:{disable:!0}}},args:{rootClass:"spectrum-Icon",setName:"workflow",iconName:"ABC",size:"xl"},parameters:{status:{type:["accordion","actionbar","actionbutton","actiongroup","actionmenu","alertbanner","alertdialog","avatar","badge","breadcrumb","button","buttongroup","calendar","card","checkbox","clearbutton","closebutton","colorarea","colorhandle","colorloupe","colorslider","colorwheel","combobox","contextualhelp","divider","dropzone","fieldgroup","fieldlabel","floatingactionbutton","helptext","illustratedmessage","infieldbutton","inlinealert","link","menu","opacitycheckerboard","page","picker","pickerbutton","popover","progressbar","progresscircle","radio","rating","search","sidenav","slider","splitview","steplist","stepper","swatch","swatchgroup","switch","table","tabs","tag","taggroup","textfield","thumbnail","toast","tooltip","tray","treeview","typography","underlay","well"].includes("icon")?"migrated":void 0}}},Default=args=>(0,_template__WEBPACK_IMPORTED_MODULE_0__.Y)({...args,iconName:args.iconName??args.uiIconName,setName:args.setName??(args.uiIconName?"ui":"workflow")});Default.args={},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'args => Template({\n  ...args,\n  iconName: args.iconName ?? args.uiIconName,\n  setName: args.setName ?? (args.uiIconName ? "ui" : "workflow")\n})',...Default.parameters?.docs?.source}}};const __namedExportsOrder=["Default"]}}]);