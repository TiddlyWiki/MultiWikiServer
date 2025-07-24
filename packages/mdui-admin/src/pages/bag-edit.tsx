


const createForm = (value: IndexJson["bagList"][number] | null) => {
    console.log(value);
    const form = new forms.FormGroup({
      bag_name: new forms.FormControl(value?.bag_name ?? "", {
        nonNullable: true, validators: [forms.Validators.required]
      }),
      description: new forms.FormControl(value?.description ?? "", {
        nonNullable: true, validators: [forms.Validators.required]
      }),
      owner_id: new forms.FormControl<string | null>(value?.owner_id ?? null),
    });
    if (value) form.controls.bag_name.disable();
    return form;
  }