import { css } from "lit";

export const styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex:1;
    }
    .progress {
      position: relative;
      width: 2.5rem;
      height: 2.5rem;
      display:flex;
      align-items: center;
      justify-content: center;
    }
    .progress-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 2.5rem;
      height: 2.5rem;
      /* stroke: rgb(var(--mdui-color-surface-container)) */
    }
    .progress-number {
      font-size: 1rem;
      font-weight: bold;
    }

    .page {
      display:flex;
      flex-direction:row;
      flex:1;
    }
    .page-list {
      width:100%;
      background-color: rgb(var(--mdui-color-surface));
    }
    .bp-desktop .page-list, .bp-wide .page-list {
      max-width: 25rem;
      margin-right:2rem;
    }
    .bp-tablet .page-list {
      max-width: 25rem;
      margin-right:1rem;
    }
    .bp-mobile .page-list {
      /* margin-left: 1rem; */
      /* margin-right: 1rem; */
    }
    .list-column, .detail-column {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .list-completed-check {
      border-width:.25rem;
      border-color: rgb(var(--mdui-color-primary));
      color: rgb(var(--mdui-color-primary));
    }
    
  `