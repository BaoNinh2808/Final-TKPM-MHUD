document.addEventListener('DOMContentLoaded', function(){
    // Initialize Tagify on the email input field
    var input = document.querySelector('#requestEmails');
    var tagify = new Tagify(input, {
        delimiters: ",  ",  // Default delimiter is comma and space
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Email validation pattern
        whitelist: [],  // Optionally, provide a list of suggestions
        dropdown: {
            enabled: 1, // Show suggestions dropdown
            position: "input", // Suggestion dropdown position
            highlightFirst: true
        }
    });

    document.getElementById('newRequestModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('newRequestForm').reset();
        tagify.removeAllTags();
    });

    const form = document.getElementById('newRequestForm');
    const submitButton = document.getElementById('createRequestBtn');

    // Function to handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault(); // Prevent the default form submission

        getTagValues(); // Get tag values and set as input value

        // Check if form is valid
        if (!form.checkValidity()) {
            form.reportValidity(); // Show validation messages
            return;
        }

        // Create a FormData object from the form element
        const formData = new FormData(form);

        // Convert FormData to a plain object
        const dataObject = {};
        formData.forEach((value, key) => {
            dataObject[key] = value;
        });

        console.log(dataObject);

        // Send data using fetch API
        const response = await fetch('/requestFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataObject),
        })

        // handle response
        if (response.ok) {
            showRightBelowToast("Request sent successfully");
            delay(1000);
            // clear form and hide modal
            form.reset();
            $('#newRequestModal').modal('hide');
        } else {
            showRightBelowToast(`<p class="color-red">Send request error</p>`);
        }

        
    }

    // Attach the submit event listener to the form
    submitButton.addEventListener('click', handleFormSubmit);

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to get tag values and set as input value
    function getTagValues() {
        const input = document.getElementById('requestEmails');

        // Get all tags
        var tags = tagify.value; // This returns an array of tag objects

        // Extract the value of each tag and join them with comma
        var tagValues = tags.map(tag => tag.value).join(', ');

        // Set the tag values as the value of the input field
        if (tagValues) {
            input.value = tagValues;
        } 
    }
});