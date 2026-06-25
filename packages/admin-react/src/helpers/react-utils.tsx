
import { PropsWithChildren, ReactNode, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { from, NEVER, Observable, Observer, Subscription } from "rxjs";
import * as forms from "angular-forms-only";
import { Autocomplete, MenuItem, MenuItemProps, SvgIcon, SxProps, TextField, Theme } from "@mui/material";
import { Subject } from "rxjs";

export class EventEmitter<T> extends Subject<T> {

  emit(value: T) {
    this.next(value);
  }

}
export function useEventEmitter<T>() {
  return useMemo(() => new EventEmitter<T>(), []);
}

/** Calls func.bind with the provided args, and stores the result in useMemo, refreshing whenever the func or args change */
export function useBind<T, A extends any[], B extends any[], R>(
  func: (this: T, ...args: [...A, ...B]) => R, thisArg: T, ...argArray: A
): (...args: B) => R {
  if (thisArg === undefined) throw new Error("thisArg cannot be undefined, use null if necessary");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => func.bind(thisArg, ...argArray), [func, ...argArray]);
}


export function useSubscriptionClosed(subs: Subscription) {
  return useSyncExternalStore(
    useCallback((onStoreChange) => {
      subs.add(onStoreChange);
      return () => subs.remove(onStoreChange);
    }, [subs]),
    () => subs.closed
  );
}


/**
 * Subscribes useSyncExternalStore to the observable.
 * 
 * @param obs The observable to subscribe. Follows switchAll behavior when the instance changes. Subscribes to a Promise using `from(obs)`.
 * @param initialValue Passed to useRef and returned until the first emission from the observable.
 * @param map Maps emissions from the observable but not the initial value.
 * This is called to map the observable to subsequent values. If not specified, the latest emission is returned directly. 
 * It is not a dependancy, but is passed into the useMemo call when the observable instance changes. 
 * @returns 
 */
export function useObservable<T>(obs: Observable<T> | Promise<T> | undefined): T | undefined;
export function useObservable<T>(obs: Observable<T> | Promise<T> | undefined, initialValue: T): T;
export function useObservable<T, I>(obs: Observable<T> | Promise<T> | undefined, initialValue: I): T | I;
export function useObservable<T, U>(obs: Observable<T> | Promise<T> | undefined, initialValue: U, map?: (value: T) => U): U;
export function useObservable(obs: Observable<unknown> | Promise<unknown> | undefined, initialValue?: unknown, map?: (value: unknown) => unknown): unknown {
  const ref = useRef(initialValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doCheck = useMemo(() => subscribeEffectBody(obs === undefined ? NEVER : obs instanceof Promise ? from(obs) : obs, ref, map), [obs]);
  return useSyncExternalStore(doCheck, () => ref.current);
}

/**
 * (`useLayoutEffect`) Subscribes the observer to the observable, unsubscribing when either of them change. 
 * 
 * @param obs The observable to subscribe. Subscribes to a Promise using `from(obs)`.
 * @param observerOrNext An observer object or a callback function.
 */
export function useObserver<T>(obs: Observable<T> | Promise<T>, observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | undefined) {
  useLayoutEffect(() => {
    const obs2 = obs instanceof Promise ? from(obs) : obs;
    const sub = obs2.subscribe(observerOrNext);
    return () => sub?.unsubscribe();
  }, [obs, observerOrNext]);
}

/**
 * (`useLayoutEffect`) Subscribes the observer to the observable, unsubscribing when either of them change. 
 * 
 * @param obsIn The observable to subscribe. Subscribes to a Promise using `from(obs)`.
 * @param observerOrNext An observer object or a callback function.
 */
export function useForward<T>(obsIn: Observable<T> | Promise<T>, obsOut: EventEmitter<T>) {
  useLayoutEffect(() => {
    const sub = (obsIn instanceof Promise ? from(obsIn) : obsIn).subscribe((e) => { obsOut.emit(e); });
    return () => sub?.unsubscribe();
  }, [obsIn, obsOut]);
}


function subscribeEffectBody<T, U>(obs: Observable<T>, ref: { current: U }, map?: (value: T) => U) {
  return (next: () => void) => {
    const sub = obs.subscribe((e) => { ref.current = map ? map(e) : e as any; next(); });
    return () => sub.unsubscribe();
  };
}
/**
 * A useEffect wrapper which unsubscribes a cleanup subscription on cleanup.
 * 
 * @param subscribeEffect Imperative function called by useEffect that should return a cleanup subscription `{ unsubscribe: () => void }` or `undefined`.
 * @param deps Passed to useEffect with an empty array as default.
 */
export function useSubscribeEffect<T>(subscribeEffect: () => { unsubscribe: () => void } | undefined, deps: React.DependencyList = []) {
  useEffect(() => {
    const sub = subscribeEffect();
    return () => sub?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
/**
 * A useLayoutEffect wrapper which unsubscribes a cleanup subscription on cleanup.
 * 
 * @param subscribeEffect Imperative function called by useLayoutEffect that must return a cleanup subscription `{ unsubscribe: () => void }`.
 * @param deps Passed to useLayoutEffect with an empty array as default.
 */
export function useSubscribeLayoutEffect<T>(subscribeEffect: () => { unsubscribe: () => void }, deps: React.DependencyList = []) {
  useLayoutEffect(() => {
    const sub = subscribeEffect();
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}


export function SelectField<V>({
  title, required, multiple, sx, control, options
}: PropsWithChildren<{
  title?: string,
  required?: boolean,
  multiple: true,
  sx?: SxProps<Theme>
  control: forms.AbstractControl<V[]>,
  options: { value: V, label: string }[]
  helperText?: string;
}>): ReactNode;
export function SelectField<V>({
  title, required, multiple, sx, control, options
}: PropsWithChildren<{
  title?: string,
  required: true,
  multiple?: false,
  sx?: SxProps<Theme>
  control: forms.AbstractControl<V>,
  options: { value: V, label: string }[]
  helperText?: string;
}>): ReactNode;
export function SelectField<V>({
  title, required, multiple, sx, control, options
}: PropsWithChildren<{
  title?: string,
  required?: false,
  multiple?: false,
  sx?: SxProps<Theme>
  control: forms.AbstractControl<V | null>,
  options: { value: V, label: string }[]
  helperText?: string;
}>): ReactNode;
export function SelectField<V>({
  title, required, multiple, sx, control, options, helperText
}: PropsWithChildren<{
  title?: string,
  required?: boolean
  multiple?: boolean
  sx?: SxProps<Theme>
  control: forms.AbstractControl<any>,
  options: { value: V, label: string }[]
  helperText?: string;
}>) {
  const html_id = useId();
  useObservable(control.events);
  const valueMap = useMemo(() => new Map(options.map((e) => [e.value, e])), [options]);

  const valueInner = useMemo(() =>
    multiple ? (control.value as V[]).map(e => valueMap.get(e))
      : (control.value && valueMap.get(control.value as any))
    , [control.value, multiple, valueMap]);

  return <Autocomplete
    sx={sx}
    options={options}
    disableClearable={required}
    renderInput={(params) => <TextField
      error={control.touched && control.invalid}
      required={required}
      {...params}
      label={title}
    />}
    multiple={multiple}
    onBlur={() => control.markAsTouched()}
    value={valueInner as any}
    onChange={(event, value) => {
      if (multiple)
        control.setValue((value as { value: V, label: string }[]).map(e => e.value) as any);
      else
        control.setValue(value && value.value);
      control.markAsDirty();
    }}
  />

  // return <FormControl sx={sx}>
  //   {title && <InputLabel id={html_id} required={required} error={control.touched && control.invalid}>{title}</InputLabel>}
  //   <Select<T | null>
  //     input={<OutlinedInput
  //       // onBlur={() => { control.markAsTouched() }}
  //       label={title}
  //     // error={control.touched && control.invalid}
  //     />}
  //     labelId={title && html_id}
  //     value={control.value}
  //     disabled={control.disabled}
  //     displayEmpty={displayEmpty}
  //     error={control.touched && control.invalid}
  //     onChange={(event: SelectChangeEvent<T | null>) => {
  //       console.log(event.target.value);
  //       control.setValue(event.target.value as any);
  //       control.markAsDirty();
  //     }}
  //     onBlur={() => control.markAsTouched()}
  //   >
  //     {children}
  //   </Select>
  // </FormControl>
}

export interface SelectOptionProps extends MenuItemProps {
  value: any;
}

export function SelectOption<T>({ value, children, ...rest }: SelectOptionProps) {
  // value works without being passed to the MenuItem
  return <MenuItem {...rest}>{children}</MenuItem>
}


export function MissingFavicon() {
  return <SvgIcon>
    <svg xmlns="http://www.w3.org/2000/svg" width="680" height="317pt" viewBox="34 107 510 317">
      <path d="m204.10294 372.67294 2.81039.8291c3.53151-1.58007 10.63031.86197 14.3959 2.05591-6.934-7.68695-17.38058-18.97509-24.90698-26.09145-2.4704-8.61546-1.41632-17.2848-.88481-26.0799l.10661-.7276c-2.96672 7.0407-6.73159 13.8847-8.75512 21.29577-2.36798 9.99817 10.5243 20.78568 15.5234 26.96817Zm214.89999 42.28504c-19.34998-.54698-27.86099-.49994-37.71558-16.70502l-7.68051.22004c-8.93988-.397-5.2142-.21705-11.1784-.51399-9.9719-.38803-8.37448-9.86297-10.12879-14.86898-2.8063-16.99305 3.71359-34.07392 3.50791-51.07032-.07282-6.03332-8.61032-27.38909-11.6604-35.02423-9.56162 1.80024-19.17511 2.14347-28.8754 2.62683-22.35922-.05477-44.5668-2.79281-66.61382-6.26983-4.29641 17.74804-17.06701 42.58935-6.5111 60.62682 12.81291 18.65766 21.80439 23.82667 35.7414 24.95164 13.93686 1.12406 17.0839 16.85904 13.71207 22.47903-2.98447 3.88403-8.22986 4.58905-12.68646 5.53003l-8.9144.41898c-7.01489-.23599-13.28491-2.12998-19.53552-5.051-10.43848-5.82696-21.2195-17.94095-29.22959-26.63797 1.86481 3.47299 2.97712 10.25293 1.28571 13.40802-4.7359 6.70896-25.21872 6.66797-34.59912 2.49897-10.65598-4.73502-36.40497-37.98197-40.386-62.88245 10.591-20.02872 26.02-37.47495 33.826-59.28323-17.015-10.85694-26.128-28.53113-24.94499-48.55152l.427-2.3175c-16.74199 3.13418-8.05998 1.96809-26.069976 3.33049-57.356004-.17549-107.796005-39.06484-79.393997-99.505786 1.846985-3.57904 3.603989-6.833004 6.735001-5.278994 2.512985 1.24695 2.152008 6.24898.887985 11.79598-16.234985 72.21878 63.111997 72.77153 111.887997 59.40782 4.84098-1.3266 14.46898-10.2612 21.13848-13.22311 10.9019-4.84113 22.7348-6.8053 34.47801-8.22059 29.20767-3.32814 64.31171 12.05838 82.14798 12.56079 17.83648.50239 43.20953-4.27082 58.785-3.26582 11.30133.51708 22.39853 2.55699 33.30252 5.46282 7.05802-34.3909 7.55701-59.737904 24.289-65.6059 9.82001 1.550995 17.38696 14.93298 22.98801 22.08301l.02298-.00403c11.40697-.45001 22.26203 2.44403 33.05499 5.65599 19.54004-2.772964 35.93702-13.74597 53.193-22.28198-.05396.268995-.33594.35998-.50397.54098-16.98199 13.73401-19.35405 36.95803-17.35602 58.43425.74304 11.14415-2.406 23.24344-6.29895 34.65357-7.28503 18.5899-21.35406 38.18498-37.68304 37.17997-6.17298-.19526-9.75901-3.69059-14.34699-7.4223-.89001 7.55863-4.388 14.30321-7.76001 20.98812-7.78698 14.82183-28.13598 21.35339-46.97802 37.18005-18.84076 15.8269 6.02902 72.35141 12.05902 82.65039 6.02902 10.29996 22.85998 14.06796 16.32901 23.36392-1.99799 3.07004-5.05301 4.16806-8.31803 5.35904Z" />
    </svg>
  </SvgIcon>
}




export function useBeforeExit(dirty: boolean) {

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Changes may not be saved.';
    };

    if (dirty) window.onbeforeunload = handler;

    return () => {
      if (window.onbeforeunload === handler)
        window.onbeforeunload = null;
    }
  }, [dirty]);
}