using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    public sealed class OnibusZeroPassenger : MonoBehaviour
    {
        private Vector3 startPosition;
        private bool collected;

        private void Awake()
        {
            startPosition = transform.position;
        }

        public bool Collect()
        {
            if (collected)
            {
                return false;
            }

            collected = true;
            gameObject.SetActive(false);
            return true;
        }

        public void ResetState()
        {
            collected = false;
            transform.position = startPosition;
            gameObject.SetActive(true);
        }
    }
}
