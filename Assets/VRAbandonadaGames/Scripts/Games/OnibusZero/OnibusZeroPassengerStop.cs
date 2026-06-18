using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    [RequireComponent(typeof(Collider))]
    public sealed class OnibusZeroPassengerStop : MonoBehaviour
    {
        [SerializeField] private OnibusZeroPassenger[] passengers;
        [SerializeField] private OnibusZeroGameManager gameManager;
        [SerializeField] private GameObject pickupFx;

        private bool emptied;

        private void OnTriggerEnter(Collider other)
        {
            var bus = other.GetComponentInParent<OnibusZeroBusController>();
            if (bus != null)
            {
                bus.SetNearbyStop(this);
            }
        }

        private void OnTriggerExit(Collider other)
        {
            var bus = other.GetComponentInParent<OnibusZeroBusController>();
            if (bus != null)
            {
                bus.ClearNearbyStop(this);
            }
        }

        public void TryPickup(OnibusZeroBusController bus)
        {
            if (emptied || bus == null || !bus.CanPickupPassenger)
            {
                return;
            }

            var picked = 0;
            foreach (var passenger in passengers)
            {
                if (passenger != null && passenger.Collect())
                {
                    picked++;
                }
            }

            if (picked <= 0)
            {
                return;
            }

            emptied = true;
            if (pickupFx != null)
            {
                pickupFx.SetActive(true);
            }

            gameManager?.RegisterPassengerPickup(picked);
        }

        public void ResetState()
        {
            emptied = false;
            if (pickupFx != null)
            {
                pickupFx.SetActive(false);
            }
        }
    }
}
