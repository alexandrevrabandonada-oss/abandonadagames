using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    public sealed class RioVivoCameraFollow : MonoBehaviour
    {
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 offset = new Vector3(0f, 12f, -10f);
        [SerializeField] private float followSpeed = 5f;

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }

        private void LateUpdate()
        {
            if (target == null)
            {
                return;
            }

            var desiredPosition = target.position + offset;
            transform.position = Vector3.Lerp(transform.position, desiredPosition, Time.deltaTime * followSpeed);
            transform.rotation = Quaternion.Euler(45f, 0f, 0f);
        }
    }
}
