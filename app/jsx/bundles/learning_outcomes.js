//
// Copyright (C) 2012 Instructure, Inc.
//
// This file is part of Canvas.
//
// Canvas is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, version 3 of the License.
//
// Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License along
// with this program. If not, see <http://www.gnu.org/licenses/>.
//

import $ from 'jquery'
import ToolbarView from 'compiled/views/outcomes/ToolbarView'
import SidebarView from 'compiled/views/outcomes/SidebarView'
import ContentView from 'compiled/views/outcomes/ContentView'
import FindDialog from 'compiled/views/outcomes/FindDialog'
import OutcomeGroup from 'compiled/models/OutcomeGroup'
import browserTemplate from 'jst/outcomes/browser'
import instructionsTemplate from 'jst/outcomes/mainInstructions'
import React from 'react'
import ReactDOM from 'react-dom'
import OutcomesActionsPopoverMenu from 'jsx/outcomes/OutcomesActionsPopoverMenu'

const renderInstructions = ENV.PERMISSIONS.manage_outcomes

const $el = $('#outcomes')
$el.html(browserTemplate({
  canManageOutcomes: ENV.PERMISSIONS.manage_outcomes,
  canManageRubrics: ENV.PERMISSIONS.manage_rubrics,
  contextUrlRoot: ENV.CONTEXT_URL_ROOT
}))

ReactDOM.render(
  <OutcomesActionsPopoverMenu
    contextUrlRoot={ENV.CONTEXT_URL_ROOT}
    permissions={ENV.PERMISSIONS}
  />,
  $el.find('#popoverMenu')[0]
)

export const toolbar = new ToolbarView({el: $el.find('.toolbar')})

export const sidebar = new SidebarView({
  el: $el.find('.outcomes-sidebar .wrapper'),
  rootOutcomeGroup: new OutcomeGroup(ENV.ROOT_OUTCOME_GROUP),
  selectFirstItem: !renderInstructions
})
sidebar.$el.data('view', sidebar)

export const content = new ContentView({
  el: $el.find('.outcomes-content'),
  instructionsTemplate,
  renderInstructions
})

// toolbar events
toolbar.on('goBack', sidebar.goBack)
toolbar.on('add', sidebar.addAndSelect)
toolbar.on('add', content.add)
toolbar.on('find', () => sidebar.findDialog(FindDialog))

// sidebar events
sidebar.on('select', model => content.show(model))
sidebar.on('select', toolbar.resetBackButton)

// content events
content.on('addSuccess', sidebar.refreshSelection)
content.on('deleteSuccess', () => {
  const view = sidebar.$el.find('.outcome-group.selected:last').data('view')
  const model = view && view.model
  content.show(model)
})
content.on('move', (model, newGroup) => sidebar.moveItem(model, newGroup))
