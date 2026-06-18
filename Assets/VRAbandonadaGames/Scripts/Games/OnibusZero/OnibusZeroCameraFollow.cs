using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    public sealed class OnibusZeroCameraFollow : MonoBehaviour
    {
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 offset = new Vector3(0f, 18f, -12f);
        [SerializeField] private Vector3 lookAtOffset = new Vector3(0f, 0f, 4f);
        [SerializeField] private float followLerp = 6f;

        private void LateUpdate()
        {
            if (target == null)
            {
                return;
            }

            var desiredPosition = target.position + offset;
            transform.position = Vector3.Lerp(transform.position, desiredPosition, Time.deltaTime * followLerp);
            transform.LookAt(target.position + lookAtOffset);
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }
    }
}
