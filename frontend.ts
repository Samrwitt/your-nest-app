function flipContainer() {
    const flipContainer = document.querySelector('.flip-container') as HTMLElement;
    flipContainer.classList.toggle('flip');
}

function validatePassword() {
    const passwordInput = document.getElementById('registerPassword') as HTMLInputElement;
    const password = passwordInput.value;

    // Define password requirements
    const minLength: number = 12;
    const hasUpperCase: boolean = /[A-Z]/.test(password);
    const hasLowerCase: boolean = /[a-z]/.test(password);
    const hasNumber: boolean = /\d/.test(password);
    const hasSpecialChar: boolean = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

    // Validate password
    let errorMessage: string = "";
    if (password.length < minLength) {
        errorMessage += `Password must be at least ${minLength} characters long. `;
    }
    if (!hasUpperCase) {
        errorMessage += "Password must contain an uppercase letter. ";
    }
    if (!hasLowerCase) {
        errorMessage += "Password must contain a lowercase letter. ";
    }
    if (!hasNumber) {
        errorMessage += "Password must contain a number. ";
    }
    if (!hasSpecialChar) {
        errorMessage += "Password must contain a special character. ";
    }

    // Display error message
    const passwordError = document.getElementById('passwordError') as HTMLElement;
    passwordError.textContent = errorMessage;

    // Prevent form submission if there are errors
    if (errorMessage) {
        return false;
    }
}
