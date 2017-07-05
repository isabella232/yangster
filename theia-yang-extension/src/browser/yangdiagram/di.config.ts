/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule, injectable } from "inversify"

import { ClassNodeView, CompositionEdgeView, DashedEdgeView, ImportEdgeView, ModuleNodeView, NoteView } from "./views"
import { YangDiagramFactory } from "./model-factory"
import { popupModelFactory } from "./popup"
import {
    ConsoleLogger,
    LogLevel,
    TYPES,
    defaultModule,
    selectModule,
    moveModule,
    boundsModule,
    undoRedoModule,
    viewportModule,
    hoverModule,
    overrideViewerOptions,
    ViewRegistry,
    SGraphView,
    SLabelView,
    SCompartmentView,
    PolylineEdgeView,
    HtmlRootView,
    PreRenderedView
} from "sprotty/lib"
import { DiagramConfiguration } from "../diagram/diagram-configuration"
import { TheiaDiagramServer } from "../diagram/theia-diagram-server"

const yangDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope()
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log)
    rebind(TYPES.IModelFactory).to(YangDiagramFactory).inSingletonScope()
    bind(TYPES.PopupModelFactory).toConstantValue(popupModelFactory)
})

@injectable()
export class YangDiagramConfiguration implements DiagramConfiguration {
    diagramType: string = 'yang-diagram'

    createContainer(widgetId: string): Container {
        const container = new Container()
        container.load(defaultModule, selectModule, moveModule, boundsModule, undoRedoModule, viewportModule,
            hoverModule, yangDiagramModule)
        container.bind(TYPES.ModelSource).to(TheiaDiagramServer).inSingletonScope()
        overrideViewerOptions(container, {
            needsClientLayout: true,
            baseDiv: widgetId
        })

        // Register views
        const viewRegistry = container.get<ViewRegistry>(TYPES.ViewRegistry)
        viewRegistry.register('graph', SGraphView)
        viewRegistry.register('node:class', ClassNodeView)
        viewRegistry.register('node:module', ModuleNodeView)
        viewRegistry.register('node:note', NoteView)
        viewRegistry.register('label:heading', SLabelView)
        viewRegistry.register('label:text', SLabelView)
        viewRegistry.register('comp:comp', SCompartmentView)
        viewRegistry.register('edge:straight', PolylineEdgeView)
        viewRegistry.register('edge:composition', CompositionEdgeView)
        viewRegistry.register('edge:dashed', DashedEdgeView)
        viewRegistry.register('edge:import', ImportEdgeView)
        viewRegistry.register('html', HtmlRootView)
        viewRegistry.register('pre-rendered', PreRenderedView)

        return container
    }

}