import { AfterViewInit, ChangeDetectorRef, Component, ViewContainerRef } from '@angular/core';
import { ElementFactory, Question, Serializer } from 'survey-core';
import { AngularComponentFactory, QuestionAngular } from 'survey-angular-ui';

const CUSTOM_TYPE = 'nl-question';


@Component({
    selector: "nl-question",
    template: `
        <app-nl></app-nl>
    `,
})

export class CustomNodeLinkQuestionComponent extends QuestionAngular<CustomNodeLinkQuestionModel> implements AfterViewInit {
    // call the constructor of the super class
    constructor(
        containerRef: ViewContainerRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef, containerRef);
    }
}

AngularComponentFactory.Instance.registerComponent(CUSTOM_TYPE + '-question', CustomNodeLinkQuestionComponent);

export class CustomNodeLinkQuestionModel extends Question {
    override getType() {
        return CUSTOM_TYPE;
    }

    override get name() {
        return this.getPropertyValue('name');
    }

    override set name(value) {
        this.setPropertyValue('name', value);
    }
}


ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new CustomNodeLinkQuestionModel(name);
});

Serializer.addClass(
    CUSTOM_TYPE,
    [
        {
            name: "description"
        },
        {
            name: "title"
        }
    ],
    () => {
        console.log('Custom type');
        return new CustomNodeLinkQuestionModel("");
    },
    "question"
);