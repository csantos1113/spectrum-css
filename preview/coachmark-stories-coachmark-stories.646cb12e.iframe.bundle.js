/*! For license information please see coachmark-stories-coachmark-stories.646cb12e.iframe.bundle.js.LICENSE.txt */
(globalThis.webpackChunk_spectrum_css_preview=globalThis.webpackChunk_spectrum_css_preview||[]).push([[7224,1738],{"../../components/button/stories/template.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Y:()=>Template});var lit=__webpack_require__("../../node_modules/lit/index.js"),class_map=__webpack_require__("../../node_modules/lit/directives/class-map.js"),if_defined=__webpack_require__("../../node_modules/lit/directives/if-defined.js"),when=__webpack_require__("../../node_modules/lit-html/directives/when.js"),capitalize=__webpack_require__("../../node_modules/lodash-es/capitalize.js"),lowerCase=__webpack_require__("../../node_modules/lodash-es/lowerCase.js"),template=__webpack_require__("../../components/icon/stories/template.js"),injectStylesIntoLinkTag=__webpack_require__("../../node_modules/style-loader/dist/runtime/injectStylesIntoLinkTag.js"),injectStylesIntoLinkTag_default=__webpack_require__.n(injectStylesIntoLinkTag),insertBySelector=__webpack_require__("../../node_modules/style-loader/dist/runtime/insertBySelector.js"),insertBySelector_default=__webpack_require__.n(insertBySelector),cjs_ruleSet_1_rules_12_use_2_components_button=__webpack_require__("../../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../../components/button/index.css"),button_default=__webpack_require__.n(cjs_ruleSet_1_rules_12_use_2_components_button),options={attributes:{"data-source":"processed"}};options.insert=insertBySelector_default().bind(null,"head");injectStylesIntoLinkTag_default()(button_default(),options);const Template=({rootClass="spectrum-Button",id,customClasses=[],size="m",label,hideLabel=!1,iconName,variant,staticColor,treatment,onclick,isDisabled=!1,ariaExpanded,ariaControls,...globals})=>{const{express}=globals;try{express?__webpack_require__.e(8721).then(__webpack_require__.bind(__webpack_require__,"../../components/button/themes/express.css")):__webpack_require__.e(2500).then(__webpack_require__.bind(__webpack_require__,"../../components/button/themes/spectrum.css"))}catch(e){console.warn(e)}return lit.dy`
    <button
      class=${(0,class_map.$)({[rootClass]:!0,[`${rootClass}--${treatment}`]:void 0!==treatment,[`${rootClass}--${variant}`]:void 0!==variant,[`${rootClass}--size${size?.toUpperCase()}`]:void 0!==size,[`${rootClass}--static${(0,capitalize.Z)((0,lowerCase.Z)(staticColor))}`]:void 0!==staticColor,[`${rootClass}--iconOnly`]:hideLabel,...customClasses.reduce(((a,c)=>({...a,[c]:!0})),{})})}
      id=${(0,if_defined.o)(id)}
      ?disabled=${isDisabled}
      @click=${onclick}
      aria-label=${(0,if_defined.o)(hideLabel?iconName:void 0)}
      aria-expanded=${(0,if_defined.o)(ariaExpanded?.toString())}
      aria-controls=${(0,if_defined.o)(ariaControls)}
    >
      ${(0,when.g)(iconName,(()=>(0,template.Y)({...globals,iconName,size})))}
      ${(0,when.g)(label&&!hideLabel,(()=>lit.dy`<span class=${`${rootClass}-label`}>${label}</span>`))}
    </button>
  `}},"../../components/coachmark/stories/coachmark.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,WithPopover:()=>WithPopover,__namedExportsOrder:()=>__namedExportsOrder,default:()=>coachmark_stories});var lit=__webpack_require__("../../node_modules/lit/index.js"),class_map=__webpack_require__("../../node_modules/lit/directives/class-map.js"),template=__webpack_require__("../../components/button/stories/template.js"),injectStylesIntoLinkTag=__webpack_require__("../../node_modules/style-loader/dist/runtime/injectStylesIntoLinkTag.js"),injectStylesIntoLinkTag_default=__webpack_require__.n(injectStylesIntoLinkTag),insertBySelector=__webpack_require__("../../node_modules/style-loader/dist/runtime/insertBySelector.js"),insertBySelector_default=__webpack_require__.n(insertBySelector),coachmark=__webpack_require__("../../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../../components/coachmark/index.css"),coachmark_default=__webpack_require__.n(coachmark),options={attributes:{"data-source":"processed"}};options.insert=insertBySelector_default().bind(null,"head");injectStylesIntoLinkTag_default()(coachmark_default(),options);var skin=__webpack_require__("../../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../../components/coachmark/skin.css"),skin_default=__webpack_require__.n(skin),skin_options={attributes:{"data-source":"processed"}};skin_options.insert=insertBySelector_default().bind(null,"head");injectStylesIntoLinkTag_default()(skin_default(),skin_options);const Template=({rootClass="spectrum-CoachMark",isQuiet=!1,withPopover=!1,variant,...globals})=>lit.dy`
		<div
			class=${(0,class_map.$)({[`${rootClass}Indicator`]:!0,[`${rootClass}Indicator--quiet`]:isQuiet,[`${rootClass}Indicator--${variant}`]:void 0!==variant})}
			style="display: inline-block;vertical-align: top;"
		>
			<div class="${rootClass}Indicator-ring"></div>
			<div class="${rootClass}Indicator-ring"></div>
			<div class="${rootClass}Indicator-ring"></div>
		</div>
		${withPopover?lit.dy`<div class="${rootClass}Popover" style="display: inline-block;">
					<div class="${rootClass}Popover-header">
						<div class="${rootClass}Popover-title">Zoom in</div>
					</div>
					<div class="${rootClass}Popover-content">
						Switch to the zoom tool then click and drag in the canvas to move
						your camera forward and backward.
					</div>
					<div class="${rootClass}Popover-footer">
						${(0,template.Y)({...globals,size:"m",variant:"primary",label:"Okay",treatment:"outline"})}
					</div>
			  </div>`:""}
	`,coachmark_stories={title:"Components/Coach mark",description:"The coach mark component can be used to bring added attention to specific parts of a page.",component:"CoachMark",argTypes:{withPopover:{name:"With Popover",type:{name:"boolean"},table:{type:{summary:"boolean"},category:"Component"},control:"boolean"},isQuiet:{name:"Quiet styling",type:{name:"boolean"},table:{type:{summary:"boolean"},category:"Component"},control:"boolean"},variant:{name:"Color variants",type:{name:"string"},table:{type:{summary:"string"},category:"Component"},options:["dark","light"],control:"inline-radio"}},args:{rootClass:"spectrum-CoachMark",isQuiet:!1,withPopover:!1},parameters:{actions:{handles:[]},status:{type:["accordion","actionbar","actionbutton","actiongroup","actionmenu","alertbanner","alertdialog","avatar","badge","breadcrumb","button","buttongroup","calendar","card","checkbox","clearbutton","closebutton","colorarea","colorhandle","colorloupe","colorslider","colorwheel","combobox","contextualhelp","divider","dropzone","fieldgroup","fieldlabel","floatingactionbutton","helptext","illustratedmessage","infieldbutton","inlinealert","link","menu","opacitycheckerboard","page","picker","pickerbutton","popover","progressbar","progresscircle","radio","rating","search","sidenav","slider","splitview","steplist","stepper","swatch","swatchgroup","switch","table","tabs","tag","taggroup","textfield","thumbnail","toast","tooltip","tray","treeview","typography","underlay","well"].includes("coachmark")?"migrated":void 0}}},Default=Template.bind({});Default.args={};const WithPopover=Template.bind({});WithPopover.args={withPopover:!0};const __namedExportsOrder=["Default","WithPopover"]},"../../node_modules/lit-html/directives/when.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";function n(n,o,r){return n?o():null==r?void 0:r()}__webpack_require__.d(__webpack_exports__,{g:()=>n})},"../../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../../components/button/index.css":(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__.p+"assets/css/components/button/index.css"},"../../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../../components/coachmark/index.css":(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__.p+"assets/css/components/coachmark/index.css"},"../../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../../components/coachmark/skin.css":(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__.p+"assets/css/components/coachmark/skin.css"}}]);
//# sourceMappingURL=coachmark-stories-coachmark-stories.646cb12e.iframe.bundle.js.map