/* Copyright 2014 Alexander Akhtyamov & Ilya Bogdanov.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Requires all dependencies
 */
th.define("th.Dependencies", {

    extend : 'th.lang.Class',
    
    require: [
        'th.data.Entity',
        'th.data.Gateway',
        'th.lang.Application',
        'th.lang.Controller',
        'th.lang.EventManager',
        'th.lang.NavigationLock',
        'th.lang.PathManager',
        'th.lang.PathUtils',
        'th.net.JsonProxy',
        'th.net.JsonProxyInterceptor',
        'th.ui.Component',
        'th.ui.container.Container',
        'th.ui.container.Panel',
        'th.ui.container.Viewport',
        'th.ui.container.layout.Layout',
        'th.ui.container.layout.CardLayout',
        'th.ui.container.layout.HorizontalLayout',
        'th.ui.container.layout.VerticalLayout',
        'th.ui.container.window.ErrorMessage',
        'th.ui.container.window.InformationMessage',
        'th.ui.container.window.Message',
        'th.ui.container.window.QuestionMessage',
        'th.ui.container.window.WarningMessage',
        'th.ui.container.window.Window',
        'th.ui.control.Button',
        'th.ui.control.Control',
        'th.ui.control.menu.Breadcrumbs',
        'th.ui.control.menu.MenuBar',
        'th.ui.control.menu.MenuButton',
        'th.ui.control.menu.MenuContainer',
        'th.ui.control.menu.MenuItem',
        'th.ui.control.menu.MenuLink',
        'th.ui.control.menu.MenuLinkImage',
        'th.ui.control.menu.MenuStrut',
        'th.ui.control.menu.MenuText',
        'th.ui.form.Checkbox',
        'th.ui.form.Combobox',
        'th.ui.form.Field',
        'th.ui.form.Filefield',
        'th.ui.form.Htmlarea',
        'th.ui.form.Label',
        'th.ui.form.Tablefield',
        'th.ui.form.Textarea',
        'th.ui.form.Textfield',
        'th.ui.form.Treefield'
    ]
});