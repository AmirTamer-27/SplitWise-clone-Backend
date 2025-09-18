const splitExpenses  = (totalAmount , splitType , splits)=>{
    if(splitType === "equal"){
        const splitAmount = totalAmount/splits.length
        const calculatedSplits = splits.map((member)=>{
            return {
                userId : member.userId,
                amount : splitAmount
            }
        })
        return calculatedSplits
    }
    else if(splitType === "custom"){
        return splits
    }
    else if(splitType === "percentage"){
        const calculatedSplits = splits.map((member)=>{
            return {
                userId : member.userId,
                amount : totalAmount * (member.amount/100)
            }
        })
        return calculatedSplits;
    }
    else{
        return []
    }

}

const getSettlements = (expenses)=>{
    const settlements = []
    expenses.forEach(expense => {
        expense.expenseSplits.forEach(split =>{
            if (split.userId != expense.paidBy){
                settlements.push(
                {
                    from : split.userId,
                    to : expense.paidBy,
                    amount : Number(split.amountOwed)
                }
            )
            }
        })
    });
    return settlements
}
const getNetBalances = (settlements) =>{
    const netBalances = new Map();
    settlements.forEach(settelment => {
        const amount = Number(settelment.amount); 
        netBalances.set(settelment.to , (netBalances.get(settelment.to) || 0) + amount)
        netBalances.set(settelment.from , (netBalances.get(settelment.from) || 0) - amount)
        console.log(netBalances)
    });
    return netBalances
}
const minimumTransactions = (netBalances)=>{
    const positiveBalances = []
    const negativeBalances = []
    const transactions = []
    netBalances.forEach((balance , userId) =>{
        if(balance > 0) positiveBalances.push({
            id : userId,
            amount : balance
        });
        if(balance < 0) negativeBalances.push({
            id : userId,
            amount : balance
        });
    })
    while(positiveBalances.length != 0 && negativeBalances.length != 0 ){
        positiveBalances.sort((a , b)=>{
            if (a.amount < b.amount) return -1;
            else if (a.amount > b.amount) return 1;
            else return 0
        })
        negativeBalances.sort((a , b)=>{
            if (a.amount < b.amount) return 1;
            else if (a.amount > b.amount) return -1;
            else return 0
        })

        let maxDebitor = negativeBalances[negativeBalances.length - 1]
        let maxCreditor = positiveBalances[positiveBalances.length - 1]
        if(maxCreditor.amount  < maxDebitor.amount *-1){
            transactions.push({
                from : maxDebitor.id,
                to : maxCreditor.id,
                amount : maxCreditor.amount
            })
            negativeBalances[negativeBalances.length -1].amount = maxDebitor.amount +=maxCreditor.amount
            positiveBalances.pop()
        }
        else if (maxCreditor.amount  > maxDebitor.amount *-1) {
               transactions.push({
                from : maxDebitor.id,
                to : maxCreditor.id,
                amount : maxDebitor.amount*-1
            })
              positiveBalances[positiveBalances.length -1].amount = maxCreditor.amount -= maxDebitor.amount
              negativeBalances.pop()
        }
        else{
             transactions.push({
                from : maxDebitor.id,
                to : maxCreditor.id,
                amount : maxDebitor.amount*-1
            })
            negativeBalances.pop()
            positiveBalances.pop()
        }
    }
    return transactions
}
module.exports = {splitExpenses , getSettlements , getNetBalances , minimumTransactions}