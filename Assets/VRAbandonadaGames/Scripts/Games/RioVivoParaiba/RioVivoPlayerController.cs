using UnityEngine;

namespace VRAbandonadaGames.Games.RioVivoParaiba
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class RioVivoPlayerController : MonoBehaviour
    {
        [SerializeField] private float moveSpeed = 5f;
        [SerializeField] private float gravity = -20f;
        [SerializeField] private float interactionRadius = 2.2f;
        [SerializeField] private LayerMask interactionLayerMask = ~0;
        [SerializeField] private RioVivoGameManager gameManager;
        [SerializeField] private RioVivoHUD hud;
        [SerializeField] private RioVivoTouchHUD touchHud;

        private CharacterController characterController;
        private Vector3 velocity;
        private RioVivoInteractable currentInteractable;

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
        }

        private void Start()
        {
            if (touchHud != null)
            {
                touchHud.BindInteract(TryInteract);
            }
        }

        private void Update()
        {
            Move();
            HandleInteraction();
        }

        private void Move()
        {
            var input = new Vector3(Input.GetAxisRaw("Horizontal"), 0f, Input.GetAxisRaw("Vertical"));
            input = Vector3.ClampMagnitude(input, 1f);

            if (input.sqrMagnitude > 0.001f)
            {
                var rotation = Quaternion.LookRotation(input, Vector3.up);
                transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * 10f);
            }

            velocity.y += gravity * Time.deltaTime;
            var movement = (input * moveSpeed) + (Vector3.up * velocity.y);
            characterController.Move(movement * Time.deltaTime);

            if (characterController.isGrounded && velocity.y < 0f)
            {
                velocity.y = -2f;
            }
        }

        private void HandleInteraction()
        {
            var interactable = FindNearestInteractable();
            if (currentInteractable != interactable)
            {
                if (currentInteractable != null)
                {
                    currentInteractable.SetHighlighted(false);
                }

                currentInteractable = interactable;
                if (currentInteractable != null)
                {
                    currentInteractable.SetHighlighted(true);
                }
            }

            if (hud != null)
            {
                hud.SetPrompt(interactable == null
                    ? "Aproxime-se de um ponto de cuidado e pressione E."
                    : "Pressione E para " + interactable.InteractionLabel.ToLowerInvariant() + ".");
            }

            if (touchHud != null)
            {
                touchHud.SetInteractAvailable(interactable != null);
            }

            if (interactable != null && Input.GetKeyDown(KeyCode.E))
            {
                TryInteract();
            }
        }

        private void TryInteract()
        {
            if (currentInteractable != null)
            {
                currentInteractable.Interact(gameManager);
            }
        }

        private RioVivoInteractable FindNearestInteractable()
        {
            var colliders = Physics.OverlapSphere(transform.position, interactionRadius, interactionLayerMask, QueryTriggerInteraction.Collide);
            RioVivoInteractable nearest = null;
            var nearestDistance = float.MaxValue;

            foreach (var collider in colliders)
            {
                var interactable = collider.GetComponentInParent<RioVivoInteractable>();
                if (interactable == null || !interactable.CanInteract(gameManager))
                {
                    continue;
                }

                var distance = Vector3.Distance(transform.position, interactable.transform.position);
                if (distance < nearestDistance)
                {
                    nearest = interactable;
                    nearestDistance = distance;
                }
            }

            return nearest;
        }
    }
}
