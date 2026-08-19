# Sales Support Agent
def sales_agent(state):

    return {
        "department": "Sales",
        "agent_response":
        f"""Dear {state['customer_name']},

The requested pricing information is displayed above.

Regards,
Sales Support Team"""
    }


# Technical Support Agent
def technical_agent(state):

    return {
        "department": "Technical",
        "agent_response":
        f"""Dear {state['customer_name']},

The troubleshooting steps are displayed above.

Regards,
Technical Support Team"""
    }


# Billing Support Agent
def billing_agent(state):

    return {
        "department": "Billing",
        "agent_response":
        f"""Dear {state['customer_name']},

Your request has been received.

If approval is required, it will be processed by the supervisor.

Regards,
Billing Support Team"""
    }


# Account Support Agent
def account_agent(state):

    return {
        "department": "Account",
        "agent_response":
        f"""Dear {state['customer_name']},

The account information is displayed above.

Regards,
Account Support Team"""
    }