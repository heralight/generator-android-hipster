package <%= appPackage %>.ui.<%= activityPackageName %>

import android.os.Bundle;
import <%= appPackage %>.di.ActivityScope
import <%= appPackage %>.ui.base.BaseActivity
import <%= appPackage %>.di.HasComponent
import <%= appPackage %>.R
import <%= appPackage %>.application.App
<% if (componentType == 'createNew') { %>import <%= appPackage %>.di.components.Dagger<%= activityName %>Component
import <%= appPackage %>.di.components.<%= activityName %>Component
import <%= appPackage %>.di.modules.<%= activityName %>Module<% } else if (componentType == 'useApplication') { %>import <%= appPackage %>.di.components.ApplicationComponent<% } else {  %>import <%= appPackage %>.di.components.<%= useExistingComponentName %>Component
import <%= appPackage %>.di.modules.<%= useExistingComponentName %>Module
import <%= appPackage %>.di.components.Dagger<%= useExistingComponentName %>Component<% } %>
<% if (nucleus == true) { %>import nucleus.factory.PresenterFactory <% } %>

import javax.inject.Inject

@ActivityScope
class <%= activityName %>Activity : BaseActivity<<%= activityName %>Presenter>(), <%= activityName %>View, HasComponent<<% if (componentType == 'createNew') { %><%= activityName %>Component<% } else if (componentType == 'useApplication') { %>ApplicationComponent<% } else {  %><%= useExistingComponentName %>Component<% } %>> {

    @Inject
    lateinit var <%= activityName.charAt(0).toLowerCase() + activityName.slice(1) %>Presenter: <%= activityName %>Presenter

    lateinit var <% if (componentType == 'createNew') { %><%= activityName.charAt(0).toLowerCase() + activityName.slice(1) %>Component: <%= activityName %>Component<% } else if (componentType == 'useApplication') { %>applicationComponent: ApplicationComponent<% } else {  %><%= underscoreUseExistingComponentName %>Component: <%= useExistingComponentName %>Component<% } %>

    override fun injectModule() {
        <% if (componentType == 'createNew') { %><%= activityName.charAt(0).toLowerCase() + activityName.slice(1) %>Component = Dagger<%= activityName %>Component.builder().applicationComponent(App.get(this).getComponent()).<%= activityName.charAt(0).toLowerCase() + activityName.slice(1)  %>Module(<%= activityName %>Module(this)).build()
        <%= activityName.charAt(0).toLowerCase() + activityName.slice(1) %>Component.inject(this)
        <% } else if (componentType == 'useApplication') { %>applicationComponent = App.get(this).getComponent()
        applicationComponent.inject(this)<% } else if (useExistingComponentNameApplication == false) {  %>
        <%= underscoreUseExistingComponentName %>Component = Dagger<%= useExistingComponentName %>Component.builder().applicationComponent(App.get(this).getComponent()).<%= underscoreUseExistingComponentName  %>Module(<%= useExistingComponentName %>Module(this)).build()
        <%= underscoreUseExistingComponentName %>Component.inject(this)<% } else { %><%= underscoreUseExistingComponentName %>Component = App.get(this).get<%= useExistingComponentName %>Component()
        <%= underscoreUseExistingComponentName %>Component.inject(this)
        <% } %>
    }

    <% if (nucleus == true) { %>override fun getPresenterFactory(): PresenterFactory<<%= activityName %>Presenter>? = PresenterFactory { <%= activityName.charAt(0).toLowerCase() + activityName.slice(1)  %>Presenter }<% } %>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun getLayoutResource(): Int {
        return R.layout.activity_<%= underscoreActivityName  %>
    }

    override fun getComponent():  <% if (componentType == 'createNew') { %><%= activityName %>Component<% } else if (componentType == 'useApplication') { %>ApplicationComponent<% } else {  %><%= useExistingComponentName %>Component<% } %> {
        return <% if (componentType == 'createNew') { %><%= activityName.charAt(0).toLowerCase() + activityName.slice(1) %>Component<% } else if (componentType == 'useApplication') { %>applicationComponent<% } else {  %><%= underscoreUseExistingComponentName %>Component<% } %>
    }

    <% if (nucleus == false) { %>
    override fun onResume() {
        super.onResume()
        getPresenter().takeView(this)
    }

    override fun onPause() {
        super.onPause()
        getPresenter().dropView()
    }<% } %>

}
