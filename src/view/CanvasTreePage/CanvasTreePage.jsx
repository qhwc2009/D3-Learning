import React from 'react';
import CanvasTree from 'components/CanvasTree/CanvasTree';
import css from './CanvasTreePage.module.scss';

function CanvasTreePage() {
  return (
    <div className={css.CanvasTreePage}>
      <CanvasTree />
    </div>
  );
}

export default CanvasTreePage;
