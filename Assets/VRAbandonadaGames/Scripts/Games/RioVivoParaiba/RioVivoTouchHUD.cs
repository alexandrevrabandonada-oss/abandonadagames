using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoTouchHUD : MonoBehaviour
    {
        [SerializeField] private GameObject root;
        [SerializeField] private Button interactButton;

        public void SetVisible(bool visible)
        {
            if (root != null)
            {
                root.SetActive(visible);
            }
        }

        public void BindInteract(UnityAction action)
        {
            if (interactButton == null)
            {
                return;
            }

            interactButton.onClick.RemoveAllListeners();
            if (action != null)
            {
                interactButton.onClick.AddListener(action);
            }
        }
    }
}
