import { Component } from 'angular2/core';
import { ENV } from 'config';

//1) how base name for app for import statement?
//2) pipe config into build process instead of generating physical file

@Component({
	selector: 'my-app',
	templateUrl: 'components/app/app.html'
})

export class AppComponent {

}
