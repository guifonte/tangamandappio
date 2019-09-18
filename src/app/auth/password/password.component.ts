import { Component, OnInit } from '@angular/core';
import { NgForm, FormControl, FormGroupDirective, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material';

import { AuthService } from '../auth.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
      const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
  
      return (invalidCtrl || invalidParent);
    }
  }

@Component({
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.css']
  })
  export class PasswordComponent implements OnInit {
    userId;
    buttonDisabled = true;
    passForm: FormGroup;
    matcher = new MyErrorStateMatcher();

    constructor(public authService: AuthService, public route: ActivatedRoute, private formBuilder: FormBuilder) {
        this.passForm = this.formBuilder.group({
            oldPassword: ['',[Validators.required]],
            password: ['', [Validators.required]],
            confirmPassword: ['']
          }, { validator: this.checkPasswords });
    }
    
    ngOnInit() {
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('userId')) {
              this.userId = paramMap.get('userId')
            }
        })
    }

    changePass(form: FormGroup) {
        if(form.valid) {
            this.authService.changePassword(form.value.oldPassword, form.value.password);
        }
    }

    checkPasswords(group: NgForm) { // here we have the 'passwords' group
        let oldPass = group.controls.oldPassword.value;
        let pass = group.controls.password.value;
        let confirmPass = group.controls.confirmPassword.value;

        return pass === confirmPass ? null : { notSame: true }
    }
  }