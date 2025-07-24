import { updateAttributes } from "./attributes.js";
import { createDOMElement } from "./createDOMElement.js";
import {
  NonBooleanPrimitive,
  VElement,
  VNode,
  WebJSXManagedElement,
} from "./types.js";
import {
  assignRef,
  flattenVNodes,
  getChildNodes,
  getNamespaceURI,
  getWebJSXChildNodeCache,
  getWebJSXProps,
  isNonBooleanPrimitive,
  isVElement,
  setWebJSXChildNodeCache,
  setWebJSXProps,
} from "./utils.js";

type DOMChange =
  | { type: "create"; vnode: VNode }
  | { type: "update"; node: Node; newVNode: VNode; oldVNode: VNode };

export function applyDiff(
  parent: Element | ShadowRoot,
  vnodes: VNode | VNode[]
): void {
  const newVNodes = flattenVNodes(vnodes);
  const newNodes = diffChildren(parent, newVNodes);
  const props = getWebJSXProps(parent);
  props.children = newVNodes;
  setWebJSXChildNodeCache(parent, newNodes);
}

function diffChildren(
  parent: Element | ShadowRoot,
  newVNodes: VNode[]
): Node[] {
  const parentProps = getWebJSXProps(parent);
  const oldVNodes = parentProps.children ?? [];

  if (newVNodes.length === 0) {
    if (oldVNodes.length > 0) {
      parent.innerHTML = "";
      return [];
    } else {
      // If the parent
      // a) never had any nodes
      // b) OR was managing content via dangerouslySetInnerHTML
      // we must not set parent.innerHTML = "";
      return [];
    }
  }

  const changes: DOMChange[] = [];
  let keyedMap: Map<
    NonBooleanPrimitive,
    { node: Node; oldVNode: VNode }
  > | null = null;

  const originalChildNodes =
    getWebJSXChildNodeCache(parent) ?? getChildNodes(parent);

  let hasKeyedNodes = false;

  let nodeOrderUnchanged = true;

  for (let i = 0; i < newVNodes.length; i++) {
    const newVNode = newVNodes[i];
    const oldVNode = oldVNodes[i];
    const currentNode = originalChildNodes[i];
    const newKey = isVElement(newVNode) ? newVNode.props.key : undefined;

    if (newKey !== undefined) {
      if (!keyedMap) {
        hasKeyedNodes = true;
        keyedMap = new Map();

        for (let j = 0; j < oldVNodes.length; j++) {
          const matchingVNode = oldVNodes[j];
          const key = (matchingVNode as VElement).props.key;
          if (key !== undefined) {
            const node = originalChildNodes[j];
            keyedMap.set(key, { node, oldVNode: matchingVNode });
          }
        }
      }

      const keyedNode = keyedMap.get(newKey);

      if (keyedNode) {
        if (keyedNode.oldVNode !== oldVNode) {
          nodeOrderUnchanged = false;
        }
        changes.push({
          type: "update",
          node: keyedNode.node,
          newVNode,
          oldVNode: keyedNode.oldVNode,
        });
      } else {
        nodeOrderUnchanged = false;
        changes.push({ type: "create", vnode: newVNode });
      }
    } else {
      if (
        !hasKeyedNodes &&
        canUpdateVNodes(newVNode, oldVNode) &&
        currentNode
      ) {
        changes.push({
          type: "update",
          node: currentNode,
          newVNode,
          oldVNode,
        });
      } else {
        nodeOrderUnchanged = false;
        changes.push({ type: "create", vnode: newVNode });
      }
    }
  }

  if (changes.length) {
    const { nodes, lastNode: lastPlacedNode } = applyChanges(
      parent,
      changes,
      originalChildNodes,
      nodeOrderUnchanged
    );

    // Remove any remaining nodes
    while (lastPlacedNode?.nextSibling) {
      parent.removeChild(lastPlacedNode.nextSibling);
    }

    return nodes;
  } else {
    return originalChildNodes;
  }
}

function canUpdateVNodes(
  newVNode: VNode,
  oldVNode: VNode | undefined
): boolean {
  if (oldVNode === undefined) return false;

  if (isNonBooleanPrimitive(newVNode) && isNonBooleanPrimitive(oldVNode)) {
    return true;
  } else {
    if (isVElement(oldVNode) && isVElement(newVNode)) {
      const oldKey = oldVNode.props.key;
      const newKey = newVNode.props.key;

      return (
        oldVNode.tagName === newVNode.tagName &&
        ((oldKey === undefined && newKey === undefined) ||
          (oldKey !== undefined && newKey !== undefined && oldKey === newKey))
      );
    } else {
      return false;
    }
  }
}

function applyChanges(
  parent: Element | ShadowRoot,
  changes: DOMChange[],
  originalNodes: Node[],
  nodeOrderUnchanged: boolean
): { nodes: Node[]; lastNode: Node | null } {
  const nodes: Node[] = [];

  let lastPlacedNode: Node | null = null;

  for (const change of changes) {
    if (change.type === "create") {
      let node: Node | undefined = undefined;
      if (isVElement(change.vnode)) {
        node = createDOMElement(change.vnode, getNamespaceURI(parent));
      } else {
        node = document.createTextNode(`${change.vnode}`);
      }
      if (!lastPlacedNode) {
        parent.prepend(node);
      } else {
        parent.insertBefore(node, lastPlacedNode.nextSibling ?? null);
      }
      lastPlacedNode = node;
      nodes.push(node);
    } else {
      const { node, newVNode, oldVNode } = change;
      if (isVElement(newVNode)) {
        const oldProps = (oldVNode as VElement)?.props || {};
        const newProps = newVNode.props;
        updateAttributes(node as Element, newProps, oldProps);

        if (newVNode.props.key !== undefined) {
          (node as WebJSXManagedElement).__webjsx_key = newVNode.props.key;
        } else {
          if ((oldVNode as VElement).props?.key) {
            delete (node as WebJSXManagedElement).__webjsx_key;
          }
        }

        if (newVNode.props.ref) {
          assignRef(node, newVNode.props.ref);
        }

        if (!newProps.dangerouslySetInnerHTML && newProps.children != null) {
          const childNodes = diffChildren(node as Element, newProps.children);
          setWebJSXProps(node as Element, newProps);
          setWebJSXChildNodeCache(node as Element, childNodes);
        }
      } else {
        if (newVNode !== oldVNode) {
          node.textContent = `${newVNode}`;
        }
      }

      if (!nodeOrderUnchanged) {
        if (!lastPlacedNode) {
          if (node !== originalNodes[0]) {
            parent.prepend(node);
          }
        } else {
          if (lastPlacedNode.nextSibling !== node) {
            parent.insertBefore(node, lastPlacedNode.nextSibling ?? null);
          }
        }
      }
      lastPlacedNode = node;
      nodes.push(node);
    }
  }
  return { nodes, lastNode: lastPlacedNode };
}
