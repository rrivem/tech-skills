import React from 'react';
import * as Survey from 'survey-react';
import * as widgets from 'surveyjs-widgets';
import 'survey-react/survey.css';
import merge from 'merge';

import 'jquery-ui/themes/base/all.css';
import 'nouislider/distribute/nouislider.css';
import 'select2/dist/css/select2.css';
import 'bootstrap-slider/dist/css/bootstrap-slider.css';

import 'jquery-bar-rating/dist/themes/css-stars.css';

import $ from 'jquery';
import 'jquery-ui/ui/widgets/datepicker.js';
import 'select2/dist/js/select2.js';
import 'jquery-bar-rating';

import 'pretty-checkbox/dist/pretty-checkbox.css';

// import { json } from './survey_json.js';
import taxonomy from './taxonomy.json';

//import "icheck/skins/square/blue.css";
window['$'] = window['jQuery'] = $;
//require("icheck");

export { MyQuestion } from './MyQuestion';

Survey.StylesManager.applyTheme('default');

//widgets.icheck(Survey, $);
widgets.prettycheckbox(Survey);
widgets.select2(Survey, $);
widgets.inputmask(Survey);
widgets.jquerybarrating(Survey, $);
widgets.jqueryuidatepicker(Survey, $);
widgets.nouislider(Survey);
widgets.select2tagbox(Survey, $);
//widgets.signaturepad(Survey);
widgets.sortablejs(Survey);
widgets.ckeditor(Survey);
widgets.autocomplete(Survey, $);
widgets.bootstrapslider(Survey);

let timeout;
function throttle(ms, callback, ...params) {
	clearTimeout(timeout);
	timeout = setTimeout(callback, ms, ...params);
}

function onValueChanged(model, { name, value }) {
	throttle(3000, save, model);
	console.log(name, value);
}

function onComplete({ data }) {
	console.log('Complete! ', data);
}

const separator = '>';
function getName(...paths) {
	return paths.filter(p => p).join(separator);
}

const preguntas = {
	usado: 'usado',
	conocimiento: 'conocimiento',
	interes: 'interes'
};

function nameEquals(name, value) {
	return `{${name}}=${value}`;
}

function getQuestions(children, parent, parentUsado) {
	return Object.entries(children).reduce((res, [label, { children, usado, conocimiento, interes }]) => {
		const name = getName(parent, label);
		const usadoName = getName(name, preguntas.usado);
		return [
			...res,
			{
				type: 'panel',
				title: label,
				innerIndent: 1,
				visibleIf: parentUsado && nameEquals(getName(parent, preguntas.usado), true),
				elements: [
					usado && {
						name,
						valueName: usadoName,
						label: '¿Lo has usado?',
						type: 'boolean'
					},
					interes && {
						valueName: getName(name, preguntas.interes),
						name: `¿Te interesaría trabajar con ${label}?`,
						visibleIf: usado && nameEquals(usadoName, false),
						type: 'boolean'
					},
					conocimiento && {
						valueName: getName(name, preguntas.conocimiento),
						name: `¿Qué grado de conocimiento crees tener de ${label}?`,
						visibleIf: usado && nameEquals(usadoName, true),
						type: 'rating'
					},
					...getQuestions(children, name, usado)
				]
			}
		];
	}, []);
}

function taxonomyToJsonModel(taxonomy) {
	const initialPage = {
		name: 'initial',
		title: 'Introducción',
		description: 'Indicá en qué áreas has trabajado, ahondaremos más en las que marques que si.',
		elements: Object.entries(taxonomy).reduce((res, [label, { usado, interes }]) => {
			const usadoName = getName(label, preguntas.usado);
			return [
				...res,
				usado && { name: usadoName, label: `${label} ¿Lo has usado?`, type: 'boolean' },
				interes && {
					type: 'panel',
					innerIndent: 1,
					elements: [
						{
							name: getName(label, preguntas.interes),
							label: '¿Te interesaría?',
							type: 'boolean',
							visibleIf: nameEquals(usadoName, false)
						}
					]
				}
			];
		}, [])
	};
	const pages = Object.entries(taxonomy).map(([name, { children, usado }]) => {
		const elements = getQuestions(children, name);
		return { name, title: name, visibleIf: usado && nameEquals(getName(name, preguntas.usado), true), elements };
	});
	return {
		pages: [initialPage, ...pages],
		showProgressBar: 'top',
		showQuestionNumbers: 'off',
		clearInvisibleValues: 'onHidden'
	};
}

function getPaths(name) {
	return name.split(separator);
}

function dataToStorage(data) {
	return Object.entries(data).reduce(
		(res, [name, value]) =>
			merge.recursive(
				true,
				res,
				getPaths(name)
					.reverse()
					.reduce((res, path) => ({ [path]: res }), value)
			),
		{}
	);
}

function storageToData(storage, name = '') {
	if (typeof storage !== typeof {}) {
		return { [name]: storage };
	} else {
		return Object.entries(storage).reduce(
			(res, [key, value]) => ({ ...res, ...storageToData(value, getName(name, key)) }),
			{}
		);
	}
}

const storageName = 'tech-skills';
function save({ data, currentPageNo }) {
	const info = {
		currentPageNo,
		data: dataToStorage(data)
	};
	window.localStorage.setItem(storageName, JSON.stringify(info));
}

function restore(model) {
	let info = null;
	try {
		info = JSON.parse(window.localStorage.getItem(storageName));
	} catch (e) {}
	if (info) {
		model.data = storageToData(info.data);
		model.currentPageNo = info.currentPageNo;
	}
}

const jsonModel = taxonomyToJsonModel(taxonomy);
const model = new Survey.Model(jsonModel);
restore(model);

const css = {
	pageTitle: 'page-title'
};

export function SurveyPage() {
	return (
		<div className="container">
			<h2>Tech skills</h2>
			<p>
				Estamos haciendo un relevamiento de las tecnologías con las que has trabajado o estudiado, así como
				otras que te interese poder hacerlo.
			</p>
			<Survey.Survey model={model} css={css} onComplete={onComplete} onValueChanged={onValueChanged} />
		</div>
	);
}
