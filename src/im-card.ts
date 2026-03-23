import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import 'element-internals-polyfill';
import { when } from 'lit/directives/when.js';

@customElement('im-card')
export class ImCard extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        --layout: 'horizontal';
      }

      .card {
        display: grid;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 8px;
        outline: 1px currentColor solid;
        grid-template-columns: 1fr;
        grid-template-columns: if(style(--layout: 'horizontal'): max-content 1fr; else: 1fr);
      }
    `,
  ];

  @property() imgSrc !:string;
  @property() imgAlt :string = '';
  @property() label !:string;

  render() {
    return html`
    <article class="card" part="card">
      <header part="header">
        ${ when(this.imgSrc, () => html`<div class="image">
          <img .src=${this.imgSrc} alt=${this.imgAlt}>
        </div>`) }
      </header>
      <section class="body">
        <div class="label">
          <slot name="label"></slot>
          ${ when(this.label, () => html`<span>${this.label}</span>`) }
        </div>
        <div class="content" part="content">
          <slot></slot>
        </div>
      </section>
      <footer part="footer"><slot name="footer"></slot></footer>
    </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'im-card': ImCard
  }
}