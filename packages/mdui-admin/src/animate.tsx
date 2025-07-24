export function openDetail(detail: HTMLElement, item: HTMLElement) {

  detail.hidden = false;

  // Force it into final layout so we can measure (e.g., maybe it's a grid area)
  detail.classList.add('active'); // optional final layout class

  const itemRect = item.getBoundingClientRect();
  const detailRect = detail.getBoundingClientRect();

  // Compute deltas
  const dx = itemRect.left - detailRect.left - detailRect.width / 2 + itemRect.width / 2;
  const dy = itemRect.top - detailRect.top - detailRect.height / 2 + itemRect.height / 2;
  const sx = itemRect.width / detailRect.width;
  const sy = itemRect.height / detailRect.height;

  console.log(dx, itemRect.left, detailRect.left);
  console.log(dy, itemRect.top, detailRect.top);
  console.log(sx, itemRect.width, detailRect.width);
  console.log(sy, itemRect.height, detailRect.height);

  const itemStyle = getComputedStyle(item);
  const detailStyle = getComputedStyle(detail);
  // return;
  // Starting state
  const anim = detail.animate(
    [
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        borderRadius: itemStyle.borderRadius,
        opacity: 0.6,
      },
      {
        // transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        transform: 'none',
        borderRadius: detailStyle.borderRadius,
        opacity: 1,
      }
    ],
    {
      duration: parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--mdui-motion-duration-medium2')), // ~300ms
      easing: getComputedStyle(document.documentElement)
        .getPropertyValue('--mdui-motion-easing-emphasized-decelerate'),
      fill: 'both'
    }
  );

  return anim;

}
export function closeDetail(detail: HTMLElement, originatingItem: HTMLElement) {

  const itemRect = originatingItem.getBoundingClientRect();
  const detailRect = detail.getBoundingClientRect();
  const dx = itemRect.left - detailRect.left;
  const dy = itemRect.top - detailRect.top;
  const sx = itemRect.width / detailRect.width;
  const sy = itemRect.height / detailRect.height;

  const anim = detail.animate(
    [
      {
        transform: 'none',
        borderRadius: getComputedStyle(detail).borderRadius,
        opacity: 1
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        borderRadius: getComputedStyle(originatingItem).borderRadius,
        opacity: 0
      }
    ],
    {
      duration: parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--mdui-motion-duration-short4')), // ~200ms
      easing: getComputedStyle(document.documentElement)
        .getPropertyValue('--mdui-motion-easing-emphasized-accelerate'),
      fill: 'forwards'
    }
  );

  return anim;
}
