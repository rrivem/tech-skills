import React from 'react';
import * as Survey from 'survey-react';
import * as widgets from 'surveyjs-widgets';
import 'survey-react/survey.css';

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

function onValueChanged(_, { name, value }) {
	console.log(name, value);
}

function onComplete({ data }) {
	console.log('Complete! ', data);
}

function getQuestions(children, parent, parentUsado) {
	return children.reduce((res, { title: label, children, usado, conocimiento, interes }) => {
		const name = `${parent}+${label}`;
		return [
			...res,
			{
				type: 'panel',
				title: label,
				innerIndent: 1,
				visibleIf: parentUsado && `{${parent}}=true`,
				elements: [
					usado && {
						name,
						valueName: name,
						label: '¿Lo has usado?',
						type: 'boolean'
					},
					interes && {
						name: `¿Te interesaría trabajar con ${label}?`,
						visibleIf: usado && `{${name}}=false`,
						type: 'boolean'
					},
					conocimiento && {
						name: `¿Qué grado de conocimiento crees tener de ${label}?`,
						visibleIf: usado && `{${name}}=true`,
						type: 'rating'
					},
					...getQuestions(children, name, usado)
				]
			}
		];
	}, []);
}

function getUsedLabel(label) {
	return `${label} ¿Lo has usado?`;
}

function taxonomyToJsonModel(taxonomy) {
	const initialPage = {
		name: 'initial',
		title: 'Introducción',
		description: 'Indicá en qué áreas has trabajado, ahondaremos más en las que marques que si.',
		elements: taxonomy.reduce((res, { title, usado, interes }) => {
			return [
				...res,
				usado && { name: title, label: getUsedLabel(title), type: 'boolean' },
				interes && {
					type: 'panel',
					innerIndent: 1,
					elements: [
						{
							name: `${title}+interes`,
							label: '¿Te interesaría?',
							type: 'boolean',
							visibleIf: `{${title}}=false`
						}
					]
				}
			];
		}, [])
	};
	const pages = taxonomy.map(({ title, children, usado }) => {
		const elements = getQuestions(children, title);
		return { name: title, title, visibleIf: usado && `{${title}}=true`, elements };
	});
	return {
		pages: [initialPage, ...pages],
		showProgressBar: 'top',
		showQuestionNumbers: 'off',
		clearInvisibleValues: 'onHidden'
	};
}

const jsonModel = taxonomyToJsonModel(taxonomy);
const model = new Survey.Model(jsonModel);

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
