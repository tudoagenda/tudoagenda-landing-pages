# No test for hooks

Hooks are not getting tested here because useCreateUser is calling useMutation and useToast. Both are hooks from react-query and shadcn/ui respectively. I think (and hope) that they are already tested in their respective libraries.
