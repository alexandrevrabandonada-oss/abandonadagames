using UnityEngine;

namespace VRAbandonadaGames.Games.OnibusZero
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class OnibusZeroBusController : MonoBehaviour
    {
        [SerializeField] private float acceleration = 24f;
        [SerializeField] private float brakePower = 30f;
        [SerializeField] private float steeringPower = 90f;
        [SerializeField] private float maxSpeed = 18f;
        [SerializeField] private float lowSpeedPickupThreshold = 5f;
        [SerializeField] private LayerMask obstacleMask = ~0;
        [SerializeField] private OnibusZeroGameManager gameManager;

        private Rigidbody body;
        private OnibusZeroPassengerStop nearbyStop;

        public float CurrentSpeed => body == null ? 0f : body.linearVelocity.magnitude;
        public bool CanPickupPassenger => nearbyStop != null && CurrentSpeed <= lowSpeedPickupThreshold;

        private void Awake()
        {
            body = GetComponent<Rigidbody>();
            body.useGravity = false;
            body.constraints = RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationZ | RigidbodyConstraints.FreezePositionY;
        }

        private void Update()
        {
            if (gameManager != null && !gameManager.IsMatchActive)
            {
                return;
            }

            if (Input.GetKeyDown(KeyCode.E) && CanPickupPassenger)
            {
                nearbyStop.TryPickup(this);
            }

            if (Input.GetKeyDown(KeyCode.Space))
            {
                gameManager?.RegisterNearMiss();
            }
        }

        private void FixedUpdate()
        {
            if (gameManager != null && !gameManager.IsMatchActive)
            {
                body.linearVelocity = Vector3.Lerp(body.linearVelocity, Vector3.zero, 0.2f);
                return;
            }

            var forwardInput = 0f;
            if (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow))
            {
                forwardInput += 1f;
            }

            if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow))
            {
                forwardInput -= 1f;
            }

            var steerInput = 0f;
            if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow))
            {
                steerInput -= 1f;
            }

            if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow))
            {
                steerInput += 1f;
            }

            if (forwardInput > 0f)
            {
                body.AddForce(transform.forward * (forwardInput * acceleration), ForceMode.Acceleration);
            }
            else if (forwardInput < 0f)
            {
                body.AddForce(-transform.forward * brakePower, ForceMode.Acceleration);
            }
            else
            {
                body.linearVelocity = Vector3.Lerp(body.linearVelocity, body.linearVelocity * 0.98f, 0.08f);
            }

            var speed01 = Mathf.InverseLerp(0f, maxSpeed, body.linearVelocity.magnitude);
            transform.Rotate(Vector3.up, steerInput * steeringPower * Mathf.Lerp(0.5f, 1f, speed01) * Time.fixedDeltaTime);

            var flatVelocity = Vector3.ClampMagnitude(new Vector3(body.linearVelocity.x, 0f, body.linearVelocity.z), maxSpeed);
            body.linearVelocity = new Vector3(flatVelocity.x, 0f, flatVelocity.z);
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (((1 << collision.gameObject.layer) & obstacleMask) == 0)
            {
                return;
            }

            var obstacle = collision.gameObject.GetComponentInParent<OnibusZeroObstacle>();
            if (obstacle != null)
            {
                obstacle.Hit(gameManager);
            }
        }

        public void SetNearbyStop(OnibusZeroPassengerStop stop)
        {
            nearbyStop = stop;
        }

        public void ClearNearbyStop(OnibusZeroPassengerStop stop)
        {
            if (nearbyStop == stop)
            {
                nearbyStop = null;
            }
        }
    }
}
