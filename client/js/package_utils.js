$(document).ready(function () {
   
    

   // Validation for the package form
    $("form[name='package_form']").validate({
        rules: {
            ID: { required: false },
            productID: { required: true },
            customerID: { required: true },
            name: { required: true, minlength: 2 },
            email: { required: true, email: true },
            street: { required: true },
            number: { required: true, digits: true },
            city: { required: true },
            start_date: { required: true, digits: true },
            eta: { required: false, digits: true },
            status: { required: true }
        },
        messages: {
            //ID: "Package ID is required",
            productID: "Product ID is required",
            customerID: "Customer ID is required",
            name: "Customer name is required",
            email: "Valid email is required",
            street: "Street is required",
            number: "Number is required",
            city: "City is required",
            start_date: "Order date is required",
            //eta: "ETA is required",
            status: "Status is required"
        }
    });

    // process the form
    $('#package_form').submit(function (event) {
        event.preventDefault();
        if (!$("#package_form").valid()) return;

        // Build the package object
        const packageData = {
            id: $("#ID").val(),
            prod_id: $("#productID").val(),
            customer: {
                id: $("#customerID").val(),
                name: $("#name").val(),
                email: $("#email").val(),
                address: {
                    street: $("#street").val(),
                    number: Number($("#number").val()),
                    apartment: $("#apartment").val() ? Number($("#apartment").val()) : undefined,
                    city: $("#city").val()
                }
            },
            start_date: Number($("#start_date").val()),
            eta: Number($("#eta").val()),
            status: $("#status").val()
        };

        // Remove apartment if empty
        if (!packageData.customer.address.apartment) {
            delete packageData.customer.address.apartment;
        }

        function getCompanyIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('companyId') || '1'; // default to 1 if not found
        }
        window.selectedCompanyId = getCompanyIdFromUrl();

        // Send AJAX POST request
        $.ajax({
            type: 'POST',
            url: `/buisness/${window.selectedCompanyId}/packages`, // Change 1 to the desired companyId if needed
            contentType: 'application/json',
            data: JSON.stringify(packageData),
            success: function (data) {
                alert("Package added! ID: " + data.id);
                location.href = "/list?companyId=" + window.selectedCompanyId; // Redirect to package list
            },
            error: function (jqXhr) {
                alert("Error: " + (jqXhr.responseJSON && jqXhr.responseJSON.error ? jqXhr.responseJSON.error : "Unknown error"));
            }
        });
    });

});
