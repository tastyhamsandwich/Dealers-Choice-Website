import React, { Fragment } from 'react';

type FormType = 'text' | 'password' | 'date' | 'email' | 'checkbox' | 'radio' | 'range' | 'number' | 'color' | 'file' | 'hidden' | 'image'

export function HorizontalInput(formLabel: string, formClass: string, formType: FormType = 'text', formId: string = formClass, formName: string = formClass) {

    return (
        <Fragment>
            <label htmlFor={formName}>{formLabel}</label>
            <input type={formType} className={formClass} id={formId} name={formName}></input>
        </Fragment>
    )
}

export function VerticalInput(formLabel: string, formClass: string, formType: FormType = 'text', formId: string = formClass, formName: string = formClass) {

    return (
        <Fragment>
            <label htmlFor={formName}>{formLabel}</label>
            <input type={formType} className={formClass} id={formId} name={formName}></input>
        </Fragment>
    )
}